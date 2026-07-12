import { Context, Next } from "hono";
import { SignJWT, jwtVerify } from "jose";
import { parse, serialize } from "cookie";
import { prisma } from "@komunaid/database";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function getCookieDomain(): string | undefined {
  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "";
  if (IS_PRODUCTION && COOKIE_DOMAIN && COOKIE_DOMAIN !== "localhost") {
    return COOKIE_DOMAIN;
  }
  return undefined;
}

function assertProductionSecrets() {
  if (!process.env.JWT_SECRET) {
    if (IS_PRODUCTION) {
      throw new Error("[SECURITY FATAL] JWT_SECRET must be set in production. Application cannot start.");
    }
    console.warn("[SECURITY] JWT_SECRET not set — using insecure development fallback. DO NOT use in production.");
  } else if (IS_PRODUCTION && process.env.JWT_SECRET.length < 32) {
    throw new Error("[SECURITY FATAL] JWT_SECRET must be at least 32 characters in production.");
  }
}

let secretsAsserted = false;
export function ensureSecrets() {
  if (!secretsAsserted) {
    secretsAsserted = true;
    assertProductionSecrets();
  }
}

const JWT_SECRET_RAW = process.env.JWT_SECRET || (IS_PRODUCTION ? "" : "dev-secret-change-this-in-production");
if (!JWT_SECRET_RAW && IS_PRODUCTION) {
  throw new Error("[SECURITY FATAL] JWT_SECRET is required in production.");
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const COOKIE_DOMAIN = getCookieDomain();

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  username: string;
  type: "access" | "refresh" | "reset";
  iat: number;
  exp: number;
  tokenVersion?: number;
}

export async function generateAccessToken(user: AuthUser, tokenVersion?: number): Promise<string> {
  const payload: Record<string, unknown> = {
    sub: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    type: "access",
  };

  if (tokenVersion !== undefined) {
    payload.tokenVersion = tokenVersion;
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export function generateResetToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    type: "reset",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

export async function verifyTokenWithVersion(token: string, userTokenVersion: number): Promise<JWTPayload> {
  const payload = await verifyToken(token);

  if (payload.tokenVersion !== undefined && payload.tokenVersion !== userTokenVersion) {
    throw new Error("Token version mismatch");
  }

  return payload;
}

function parseJwtExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)(m|h|d)$/);
  if (!match) return 15 * 60;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "m": return value * 60;
    case "h": return value * 60 * 60;
    case "d": return value * 24 * 60 * 60;
    default: return 15 * 60;
  }
}

export function setTokenCookies(c: Context, accessToken: string, refreshTokenHash: string) {
  const accessMaxAge = parseJwtExpiry(JWT_EXPIRES_IN);

  const accessCookie = serialize("token", accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
    domain: getCookieDomain(),
  });

  const refreshCookie = serialize("refreshToken", refreshTokenHash, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/api/v1/auth/refresh",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    domain: getCookieDomain(),
  });

  c.header("Set-Cookie", accessCookie, { append: true });
  c.header("Set-Cookie", refreshCookie, { append: true });
}

export function clearTokenCookies(c: Context) {
  const accessCookie = serialize("token", "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    domain: getCookieDomain(),
  });

  const refreshCookie = serialize("refreshToken", "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/api/v1/auth/refresh",
    maxAge: 0,
    domain: getCookieDomain(),
  });

  const refreshCookieRoot = serialize("refreshToken", "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    domain: getCookieDomain(),
  });

  c.header("Set-Cookie", accessCookie, { append: true });
  c.header("Set-Cookie", refreshCookie, { append: true });
  c.header("Set-Cookie", refreshCookieRoot, { append: true });
}

function getTokenFromCookies(c: Context): string | null {
  const cookieHeader = c.req.header("Cookie");
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies.token || null;
}

function getRefreshTokenFromCookies(c: Context): string | null {
  const cookieHeader = c.req.header("Cookie");
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies.refreshToken || null;
}

export async function authMiddleware(c: Context, next: Next) {
  let token = getTokenFromCookies(c);

  if (!token) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = await verifyToken(token);
  if (payload.type !== "access") {
    throw new Error("Unauthorized");
  }

  const userVersion = payload.tokenVersion;

  const userRecord = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { tokenVersion: true, status: true },
  });

  if (!userRecord) {
    throw new Error("Unauthorized");
  }

  if (userRecord.status !== "ACTIVE") {
    throw new Error("Forbidden");
  }

  if (userVersion !== undefined && userVersion !== userRecord.tokenVersion) {
    throw new Error("Unauthorized");
  }

  c.set("user", {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    username: payload.username as string,
  });
  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  let token = getTokenFromCookies(c);

  if (!token) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return next();
  }

  try {
    const payload = await verifyToken(token);
    if (payload.type === "access") {
      const userRecord = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { tokenVersion: true, status: true, deletedAt: true },
      });

      if (!userRecord || userRecord.status !== "ACTIVE" || userRecord.deletedAt) {
        return next();
      }

      if (payload.tokenVersion !== undefined && payload.tokenVersion !== userRecord.tokenVersion) {
        return next();
      }

      c.set("user", {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        username: payload.username as string,
      });
    }
  } catch {
    // Invalid token, continue without user
  }

  return next();
}

export function getRefreshToken(c: Context): string | null {
  return getRefreshTokenFromCookies(c);
}
