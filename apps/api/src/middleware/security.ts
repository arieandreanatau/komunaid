import { Context, Next } from "hono";

export async function securityHeaders(c: Context, next: Next) {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  c.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  await next();
}

// ==========================================
// RATE LIMITER — Redis-backed with in-memory fallback
// ==========================================

let redis: { incr(key: string): Promise<number>; pexpire(key: string, ms: number): Promise<number>; on(event: string, cb: (err: Error) => void): void } | null = null;

function getRedis(): typeof redis {
  if (redis !== undefined && redis !== null) return redis;
  try {
    const url = process.env.REDIS_URL;
    if (!url) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Redis = require("ioredis");
    const client = new Redis(url);
    client.on("error", (err: Error) => {
      console.error("[rate-limiter] Redis error:", err.message);
      redis = null;
    });
    redis = client;
    return redis;
  } catch {
    // ioredis not installed or REDIS_URL not set
  }
  redis = null;
  return null;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryHits = new Map<string, RateLimitRecord>();

export function rateLimiter(options?: { windowMs?: number; max?: number }) {
  const windowMs = options?.windowMs || 15 * 60 * 1000;
  const max = options?.max || 100;

  return async (c: Context, next: Next) => {
    const isTrustedProxy = process.env.TRUSTED_PROXIES === "true";
    const ip = isTrustedProxy
      ? (c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "unknown")
      : (c.req.header("x-real-ip") || "unknown");

    const key = `rl:${ip}`;
    const redisClient = getRedis();

    if (redisClient) {
      try {
        const current = await redisClient.incr(key);
        if (current === 1) {
          await redisClient.pexpire(key, windowMs);
        }
        if (current > max) {
          return c.json({ success: false, message: "Terlalu banyak request. Coba lagi nanti." }, 429);
        }
        c.header("X-RateLimit-Limit", String(max));
        c.header("X-RateLimit-Remaining", String(Math.max(0, max - current)));
        return next();
      } catch {
        // Redis failed, fall through to in-memory
      }
    }

    // In-memory fallback
    const now = Date.now();
    const record = memoryHits.get(ip);

    if (!record || now > record.resetTime) {
      memoryHits.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > max) {
      return c.json({ success: false, message: "Terlalu banyak request. Coba lagi nanti." }, 429);
    }

    return next();
  };
}

export function requestSizeLimit(maxSize: string = "10mb") {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const maxBytes = parseSize(maxSize);
      if (size > maxBytes) {
        return c.json({ success: false, message: "Request terlalu besar" }, 413);
      }
    }
    await next();
  };
}

function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i);
  if (!match) return 10 * 1024 * 1024;
  return parseFloat(match[1]) * units[match[2].toLowerCase()];
}

// ==========================================
// Cleanup memory store periodically (every 15 min)
// ==========================================
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryHits.entries()) {
    if (now > record.resetTime) {
      memoryHits.delete(key);
    }
  }
}, 15 * 60 * 1000);
