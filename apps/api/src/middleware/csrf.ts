import { Context, Next } from "hono";
import { serialize } from "cookie";
import { parse } from "cookie";
import { randomBytes, timingSafeEqual } from "crypto";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_BYTES = 32;

function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_BYTES).toString("hex");
}

function verifyCsrfToken(token: string, cookieToken: string): boolean {
  if (!token || !cookieToken) return false;
  if (token.length !== CSRF_TOKEN_BYTES * 2 || cookieToken.length !== CSRF_TOKEN_BYTES * 2) return false;
  try {
    return timingSafeEqual(Buffer.from(token, "utf8"), Buffer.from(cookieToken, "utf8"));
  } catch {
    return false;
  }
}

export function csrfProtection() {
  return async (c: Context, next: Next) => {
    const method = c.req.method;

    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      let token: string;
      const cookieHeader = c.req.header("Cookie");
      if (cookieHeader) {
        const cookies = parse(cookieHeader);
        const existing = cookies[CSRF_COOKIE_NAME];
        if (existing && existing.length === CSRF_TOKEN_BYTES * 2) {
          token = existing;
        } else {
          token = generateCsrfToken();
        }
      } else {
        token = generateCsrfToken();
      }
      c.header("Set-Cookie", serialize(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: IS_PRODUCTION,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      }));
      c.header("X-CSRF-Token", token);
      return next();
    }

    const csrfHeader = c.req.header(CSRF_HEADER_NAME);
    const cookieHeader = c.req.header("Cookie");

    if (!cookieHeader || !csrfHeader) {
      return c.json({ success: false, message: "CSRF token missing" }, 403);
    }

    const cookies = parse(cookieHeader);
    const csrfCookie = cookies[CSRF_COOKIE_NAME];

    if (!csrfCookie || !verifyCsrfToken(csrfHeader, csrfCookie)) {
      return c.json({ success: false, message: "CSRF token invalid" }, 403);
    }

    const newToken = generateCsrfToken();
    c.header("Set-Cookie", serialize(CSRF_COOKIE_NAME, newToken, {
      httpOnly: false,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    }));
    c.header("X-CSRF-Token", newToken);

    return next();
  };
}
