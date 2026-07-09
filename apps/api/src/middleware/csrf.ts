import { Context, Next } from "hono";
import { serialize } from "cookie";
import { parse } from "cookie";
import { randomBytes } from "crypto";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

function verifyCsrfToken(token: string, cookieToken: string): boolean {
  return token === cookieToken;
}

export function csrfProtection() {
  return async (c: Context, next: Next) => {
    const method = c.req.method;

    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      const token = generateCsrfToken();
      c.header("Set-Cookie", serialize("csrf_token", token, {
        httpOnly: false,
        secure: IS_PRODUCTION,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      }));
      c.header("X-CSRF-Token", token);
      return next();
    }

    const origin = c.req.header("origin");
    const referer = c.req.header("referer");
    const host = c.req.header("host");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost === host) {
          return next();
        }
      } catch {}
    }

    if (referer && host) {
      try {
        const refererHost = new URL(referer).host;
        if (refererHost === host) {
          return next();
        }
      } catch {}
    }

    const csrfHeader = c.req.header("x-csrf-token");
    const cookieHeader = c.req.header("Cookie");

    if (!cookieHeader || !csrfHeader) {
      return c.json({ success: false, message: "CSRF token missing" }, 403);
    }

    const cookies = parse(cookieHeader);

    const csrfCookie = cookies["csrf_token"];

    if (!csrfCookie || !verifyCsrfToken(csrfHeader, csrfCookie)) {
      return c.json({ success: false, message: "CSRF token invalid" }, 403);
    }

    return next();
  };
}
