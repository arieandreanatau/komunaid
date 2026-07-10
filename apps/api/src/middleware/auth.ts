import { Context, Next } from "hono";
import { SignJWT, jwtVerify } from "jose";
import { parse, serialize } from "cookie";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-this");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "dev-cookie-secret-change-this";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

if (IS_PRODUCTION && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-secret-change-this")) {
  throw new Error("JWT_SECRET must be set in production");
}

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
  type: "access" | "refresh";
  iat: number;
  exp: number;
}

export async function generateAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

export function setTokenCookies(c: Context, accessToken: string, refreshToken: string) {
  const accessCookie = serialize("token", accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
    domain: IS_PRODUCTION ? COOKIE_DOMAIN : undefined,
  });

  const refreshCookie = serialize("refreshToken", refreshToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/api/v1/auth/refresh",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    domain: IS_PRODUCTION ? COOKIE_DOMAIN : undefined,
  });

  c.header("Set-Cookie", accessCookie);
  c.header("Set-Cookie", refreshCookie, { append: true });
}

export function clearTokenCookies(c: Context) {
  const accessCookie = serialize("token", "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    domain: IS_PRODUCTION ? COOKIE_DOMAIN : undefined,
  });

  const refreshCookie = serialize("refreshToken", "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/api/v1/auth/refresh",
    maxAge: 0,
    domain: IS_PRODUCTION ? COOKIE_DOMAIN : undefined,
  });

  c.header("Set-Cookie", accessCookie);
  c.header("Set-Cookie", refreshCookie, { append: true });
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

  try {
    const payload = await verifyToken(token);
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }
    c.set("user", {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      username: payload.username as string,
    });
    await next();
  } catch {
    throw new Error("Unauthorized");
  }
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
