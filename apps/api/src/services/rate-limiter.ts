import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import Redis from "ioredis";
import { createChildLogger } from "../lib/logger";

const log = createChildLogger("rate-limiter");

// ==========================================
// TYPES
// ==========================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export type RateLimiterFn = (identifier: string) => Promise<RateLimitResult>;

// ==========================================
// REDIS CLIENT
// ==========================================

let redisClient: Redis | null = null;
let redisAvailable = false;
let redisInitialized = false;

function getRedisConfig() {
  return {
    url: process.env.REDIS_URL,
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || "5000", 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || "komunaid:",
  };
}

function initRedis(): Redis | null {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const config = getRedisConfig();
  if (!config.url) {
    log.warn("REDIS_URL not set — falling back to in-memory rate limiting");
    return null;
  }

  try {
    const client = new Redis(config.url, {
      connectTimeout: config.connectTimeout,
      keyPrefix: config.keyPrefix,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    client.on("error", (err: Error) => {
      log.error({ err }, "Redis connection error — falling back to in-memory");
      redisAvailable = false;
    });

    client.on("connect", () => {
      log.info("Redis connected");
      redisAvailable = true;
    });

    client.on("close", () => {
      log.warn("Redis connection closed — falling back to in-memory");
      redisAvailable = false;
    });

    client.connect().catch((err: Error) => {
      log.error({ err }, "Redis initial connect failed — falling back to in-memory");
      redisAvailable = false;
    });

    redisClient = client;
    redisAvailable = true;
    return client;
  } catch (err) {
    log.error({ err }, "Failed to create Redis client — falling back to in-memory");
    return null;
  }
}

/** Returns the Redis client if available, null otherwise. */
export function getRedisClient(): Redis | null {
  const client = redisInitialized ? redisClient : initRedis();
  if (client && redisAvailable) return client;
  return null;
}

// ==========================================
// IN-MEMORY FALLBACK
// ==========================================

interface MemoryRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryRecord>();
const backoffStore = new Map<string, { count: number; resetAt: number; windowMs: number }>();
let lastMemoryCleanup = 0;
const MEMORY_CLEANUP_INTERVAL = 60_000;

function cleanupMemoryStore() {
  const now = Date.now();
  if (now - lastMemoryCleanup < MEMORY_CLEANUP_INTERVAL) return;
  lastMemoryCleanup = now;
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetAt) memoryStore.delete(key);
  }
  for (const [key, record] of backoffStore.entries()) {
    if (now > record.resetAt) backoffStore.delete(key);
  }
}

function memoryIncr(key: string, windowMs: number): { count: number; resetAt: number } {
  cleanupMemoryStore();
  const now = Date.now();
  const record = memoryStore.get(key);
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }
  record.count++;
  return { count: record.count, resetAt: record.resetAt };
}

// ==========================================
// LUA SCRIPTS (Redis atomic operations)
// ==========================================

const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local max = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local windowStart = now - windowMs

redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

local count = redis.call('ZCARD', key)

if count < max then
  redis.call('ZADD', key, now, now .. '-' .. math.random(1000000))
  redis.call('PEXPIRE', key, windowMs)
  return {1, max - count - 1, now + windowMs, 0}
else
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retryAfter = 0
  if #oldest > 0 then
    retryAfter = math.ceil((tonumber(oldest[2]) + windowMs - now) / 1000)
  end
  return {0, 0, now + windowMs, retryAfter}
end
`;

const INCR_EXPIRE_SCRIPT = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local max = tonumber(ARGV[2])

local current = redis.call('INCR', key)
if current == 1 then
  redis.call('PEXPIRE', key, windowMs)
end

if current > max then
  local ttl = redis.call('PTTL', key)
  return {0, 0, ttl}
end

local ttl = redis.call('PTTL', key)
return {1, max - current, ttl}
`;

const BACKOFF_SCRIPT = `
local key = KEYS[1]
local baseWindowMs = tonumber(ARGV[1])
local maxAttempts = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local record = redis.call('HMGET', key, 'count', 'resetAt', 'windowMs')
local count = tonumber(record[1]) or 0
local resetAt = tonumber(record[2]) or 0
local currentWindow = tonumber(record[3]) or baseWindowMs

if now > resetAt then
  count = 0
  currentWindow = baseWindowMs
  resetAt = now + currentWindow
end

count = count + 1

if count > maxAttempts then
  local retryAfter = math.ceil((resetAt - now) / 1000)
  return {0, 0, resetAt, retryAfter, currentWindow}
end

if count > 1 then
  local backoff = baseWindowMs * math.pow(2, count - 1)
  backoff = math.min(backoff, 24 * 60 * 60 * 1000)
  currentWindow = backoff
  resetAt = now + backoff
end

redis.call('HMSET', key, 'count', count, 'resetAt', resetAt, 'windowMs', currentWindow)
redis.call('PEXPIRE', key, currentWindow)

local remaining = math.max(0, maxAttempts - count)
return {1, remaining, resetAt, 0, currentWindow}
`;

let slidingWindowScriptSha: string | null = null;
let incrExpireScriptSha: string | null = null;
let backoffScriptSha: string | null = null;

async function loadScript(client: Redis, script: string): Promise<string> {
  const sha = await client.script("LOAD", script);
  return sha as string;
}

async function ensureScripts(client: Redis) {
  if (!slidingWindowScriptSha) {
    slidingWindowScriptSha = await loadScript(client, SLIDING_WINDOW_SCRIPT);
  }
  if (!incrExpireScriptSha) {
    incrExpireScriptSha = await loadScript(client, INCR_EXPIRE_SCRIPT);
  }
  if (!backoffScriptSha) {
    backoffScriptSha = await loadScript(client, BACKOFF_SCRIPT);
  }
}

// ==========================================
// CORE RATE LIMITER FACTORY
// ==========================================

function setHeaders(c: Context, result: RateLimitResult, max: number) {
  c.header("X-RateLimit-Limit", String(max));
  c.header("X-RateLimit-Remaining", String(result.remaining));
  c.header("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  if (result.retryAfter !== undefined) {
    c.header("Retry-After", String(result.retryAfter));
  }
}

/** Creates a basic fixed-window rate limiter. */
export function createRateLimiter(key: string, windowMs: number, max: number): RateLimiterFn {
  const prefixedKey = `rl:${key}`;
  return async (identifier: string): Promise<RateLimitResult> => {
    const fullKey = `${prefixedKey}:${identifier}`;

    const client = getRedisClient();
    if (client) {
      try {
        await ensureScripts(client);
        const result = await client.eval(
          INCR_EXPIRE_SCRIPT,
          1,
          fullKey,
          String(windowMs),
          String(max)
        ) as [number, number, number];

        const allowed = result[0] === 1;
        const remaining = result[1];
        const ttl = result[2];
        const resetAt = Date.now() + (ttl > 0 ? ttl : windowMs);

        if (!allowed) {
          log.warn({ key: fullKey, max, windowMs }, "rate limit exceeded");
        }

        return {
          allowed,
          remaining: Math.max(0, remaining),
          resetAt,
          retryAfter: allowed ? undefined : Math.ceil(ttl / 1000),
        };
      } catch (err) {
        log.error({ err, key: fullKey }, "Redis error in rate limiter — falling back to memory");
      }
    }

    // In-memory fallback
    const { count, resetAt } = memoryIncr(fullKey, windowMs);
    const allowed = count <= max;
    const retryAfter = allowed ? undefined : Math.ceil((resetAt - Date.now()) / 1000);

    if (!allowed) {
      log.warn({ key: fullKey, max, windowMs }, "rate limit exceeded (memory fallback)");
    }

    return {
      allowed,
      remaining: Math.max(0, max - count),
      resetAt,
      retryAfter,
    };
  };
}

/** Creates a sliding-window rate limiter using sorted sets. */
export function createSlidingWindowRateLimiter(key: string, windowMs: number, max: number): RateLimiterFn {
  const prefixedKey = `rl:sw:${key}`;
  return async (identifier: string): Promise<RateLimitResult> => {
    const fullKey = `${prefixedKey}:${identifier}`;
    const now = Date.now();

    const client = getRedisClient();
    if (client) {
      try {
        await ensureScripts(client);
        const result = await client.eval(
          SLIDING_WINDOW_SCRIPT,
          1,
          fullKey,
          String(windowMs),
          String(max),
          String(now)
        ) as [number, number, number, number];

        const allowed = result[0] === 1;
        const remaining = result[1];
        const resetAt = result[2];
        const retryAfter = result[3] || undefined;

        if (!allowed) {
          log.warn({ key: fullKey, max, windowMs }, "sliding window rate limit exceeded");
        }

        return {
          allowed,
          remaining: Math.max(0, remaining),
          resetAt,
          retryAfter: retryAfter ? Number(retryAfter) : undefined,
        };
      } catch (err) {
        log.error({ err, key: fullKey }, "Redis error in sliding window — falling back to memory");
      }
    }

    // In-memory fallback
    const { count, resetAt } = memoryIncr(fullKey, windowMs);
    const allowed = count <= max;
    const retryAfter = allowed ? undefined : Math.ceil((resetAt - Date.now()) / 1000);

    if (!allowed) {
      log.warn({ key: fullKey, max, windowMs }, "sliding window rate limit exceeded (memory fallback)");
    }

    return {
      allowed,
      remaining: Math.max(0, max - count),
      resetAt,
      retryAfter,
    };
  };
}

/** Creates an exponential backoff limiter for brute-force protection. */
export function createExponentialBackoffLimiter(key: string, baseWindowMs: number, maxAttempts: number): RateLimiterFn {
  const prefixedKey = `rl:bo:${key}`;
  return async (identifier: string): Promise<RateLimitResult> => {
    const fullKey = `${prefixedKey}:${identifier}`;
    const now = Date.now();

    const client = getRedisClient();
    if (client) {
      try {
        await ensureScripts(client);
        const result = await client.eval(
          BACKOFF_SCRIPT,
          1,
          fullKey,
          String(baseWindowMs),
          String(maxAttempts),
          String(now)
        ) as [number, number, number, number, number];

        const allowed = result[0] === 1;
        const remaining = result[1];
        const resetAt = result[2];
        const retryAfter = result[3] || undefined;
        const currentWindow = result[4];

        if (!allowed) {
          log.warn({ key: fullKey, maxAttempts, currentWindow }, "brute force backoff triggered");
        }

        return {
          allowed,
          remaining: Math.max(0, remaining),
          resetAt,
          retryAfter: retryAfter ? Number(retryAfter) : undefined,
        };
      } catch (err) {
        log.error({ err, key: fullKey }, "Redis error in backoff limiter — falling back to memory");
      }
    }

    // In-memory fallback
    cleanupMemoryStore();
    const record = backoffStore.get(fullKey);
    let count: number;
    let resetAt: number;
    let currentWindow: number;

    if (!record || now > record.resetAt) {
      count = 1;
      currentWindow = baseWindowMs;
      resetAt = now + currentWindow;
      backoffStore.set(fullKey, { count, resetAt, windowMs: currentWindow });
    } else {
      record.count++;
      count = record.count;
      if (count > maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: record.resetAt,
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        };
      }
      if (count > 1) {
        currentWindow = Math.min(baseWindowMs * Math.pow(2, count - 1), 86_400_000);
        record.windowMs = currentWindow;
        record.resetAt = now + currentWindow;
        resetAt = record.resetAt;
      } else {
        currentWindow = record.windowMs;
        resetAt = record.resetAt;
      }
    }

    const allowed = count <= maxAttempts;
    const remaining = Math.max(0, maxAttempts - count);
    const retryAfter = allowed ? undefined : Math.ceil((resetAt - now) / 1000);

    if (!allowed) {
      log.warn({ key: fullKey, maxAttempts, currentWindow }, "brute force backoff triggered (memory fallback)");
    }

    return { allowed, remaining, resetAt, retryAfter };
  };
}

// ==========================================
// CONVENIENCE LIMITERS
// ==========================================

function getIP(c: Context): string {
  const trusted = process.env.TRUSTED_PROXIES === "true";
  if (trusted) {
    return (
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown"
    );
  }
  return c.req.header("x-real-ip") || "unknown";
}

/** Per-IP rate limiter. */
export function createIPRateLimiter(windowMs: number, max: number): RateLimiterFn {
  const limiter = createRateLimiter("ip", windowMs, max);
  return async (identifier: string) => limiter(identifier);
}

/** Per-user rate limiter. */
export function createUserRateLimiter(windowMs: number, max: number): RateLimiterFn {
  const limiter = createRateLimiter("user", windowMs, max);
  return async (identifier: string) => limiter(identifier);
}

/** Per-device fingerprint rate limiter. */
export function createDeviceRateLimiter(windowMs: number, max: number): RateLimiterFn {
  const limiter = createRateLimiter("device", windowMs, max);
  return async (identifier: string) => limiter(identifier);
}

// ==========================================
// PRE-BUILT LIMITERS (Singleton instances)
// ==========================================

const _loginLimiter = createExponentialBackoffLimiter(
  "login",
  parseInt(process.env.LOGIN_RATE_WINDOW_MS || String(15 * 60 * 1000), 10),
  parseInt(process.env.LOGIN_RATE_MAX || "5", 10)
);

const _forgotPasswordLimiter = createRateLimiter(
  "forgot-pw",
  parseInt(process.env.FORGOT_PASSWORD_RATE_WINDOW_MS || String(60 * 60 * 1000), 10),
  parseInt(process.env.FORGOT_PASSWORD_RATE_MAX || "3", 10)
);

const _resetPasswordLimiter = createRateLimiter(
  "reset-pw",
  parseInt(process.env.RESET_PASSWORD_RATE_WINDOW_MS || String(60 * 60 * 1000), 10),
  parseInt(process.env.RESET_PASSWORD_RATE_MAX || "5", 10)
);

const _refreshTokenLimiter = createRateLimiter(
  "refresh",
  parseInt(process.env.REFRESH_TOKEN_RATE_WINDOW_MS || String(15 * 60 * 1000), 10),
  parseInt(process.env.REFRESH_TOKEN_RATE_MAX || "10", 10)
);

const _apiLimiter = createRateLimiter(
  "api",
  parseInt(process.env.API_RATE_WINDOW_MS || String(15 * 60 * 1000), 10),
  parseInt(process.env.API_RATE_MAX || "100", 10)
);

const _adminMutationLimiter = createRateLimiter(
  "admin-mut",
  parseInt(process.env.ADMIN_MUTATION_RATE_WINDOW_MS || String(60 * 1000), 10),
  parseInt(process.env.ADMIN_MUTATION_RATE_MAX || "30", 10)
);

const _registrationLimiter = createRateLimiter(
  "register",
  parseInt(process.env.REGISTRATION_RATE_WINDOW_MS || String(60 * 60 * 1000), 10),
  parseInt(process.env.REGISTRATION_RATE_MAX || "5", 10)
);

const _contactFormLimiter = createRateLimiter(
  "contact",
  parseInt(process.env.CONTACT_FORM_RATE_WINDOW_MS || String(60 * 60 * 1000), 10),
  parseInt(process.env.CONTACT_FORM_RATE_MAX || "3", 10)
);

/** Login rate limiter: 5 attempts / 15 min with exponential backoff after 3 failures. */
export function loginRateLimiter(identifier: string): Promise<RateLimitResult> {
  return _loginLimiter(identifier);
}

/** Forgot-password rate limiter: 3 / hour per email. */
export function forgotPasswordRateLimiter(email: string): Promise<RateLimitResult> {
  return _forgotPasswordLimiter(email.toLowerCase().trim());
}

/** Reset-password rate limiter: 5 / hour per token. */
export function resetPasswordRateLimiter(token: string): Promise<RateLimitResult> {
  return _resetPasswordLimiter(token);
}

/** Refresh-token rate limiter: 10 / 15 min per user. */
export function refreshTokenRateLimiter(userId: string): Promise<RateLimitResult> {
  return _refreshTokenLimiter(userId);
}

/** API rate limiter: 100 / 15 min per IP. */
export function apiRateLimiter(ip: string): Promise<RateLimitResult> {
  return _apiLimiter(ip);
}

/** Admin mutation rate limiter: 30 / min per user. */
export function adminMutationRateLimiter(userId: string): Promise<RateLimitResult> {
  return _adminMutationLimiter(userId);
}

/** Registration rate limiter: 5 / hour per IP. */
export function registrationRateLimiter(ip: string): Promise<RateLimitResult> {
  return _registrationLimiter(ip);
}

/** Contact-form rate limiter: 3 / hour per IP. */
export function contactFormRateLimiter(ip: string): Promise<RateLimitResult> {
  return _contactFormLimiter(ip);
}

// ==========================================
// MIDDLEWARE FACTORY
// ==========================================

/**
 * Creates a Hono middleware from a rate limiter function.
 * The middleware resolves the identifier, applies the limiter, sets headers, and blocks if exceeded.
 */
export function rateLimitMiddleware(
  limiterFn: (identifier: string) => Promise<RateLimitResult>,
  options?: {
    getIdentifier?: (c: Context) => string | Promise<string>;
    max?: number;
    errorMessage?: string;
    statusCode?: ContentfulStatusCode;
  }
) {
  const getIdentifier = options?.getIdentifier ?? ((c: Context) => getIP(c));
  const max = options?.max ?? 100;
  const errorMessage = options?.errorMessage ?? "Terlalu banyak request. Coba lagi nanti.";
  const statusCode = options?.statusCode ?? 429;

  return async (c: Context, next: Next) => {
    const identifier = await getIdentifier(c);
    const result = await limiterFn(identifier);

    setHeaders(c, result, max);

    if (!result.allowed) {
      log.warn({ identifier, retryAfter: result.retryAfter }, "request blocked by rate limiter");
      return c.json({ success: false, message: errorMessage }, statusCode);
    }

    await next();
  };
}

// ==========================================
// CLEANUP UTILITY
// ==========================================

/** Call periodically or on shutdown to clean up Redis keys. */
export async function cleanupExpiredKeys(): Promise<void> {
  cleanupMemoryStore();

  const client = getRedisClient();
  if (!client) return;

  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", "rl:*", "COUNT", 100);
      cursor = nextCursor as string;
      for (const key of keys) {
        const ttl = await client.pttl(key);
        if (ttl <= 0) {
          await client.del(key);
        }
      }
    } while (cursor !== "0");
  } catch (err) {
    log.error({ err }, "failed to cleanup expired Redis keys");
  }
}

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      log.info("Redis connection closed");
    } catch {
      redisClient.disconnect();
    }
    redisClient = null;
    redisAvailable = false;
    redisInitialized = false;
  }
}
