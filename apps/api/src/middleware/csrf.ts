import { Context, Next } from "hono";
import { serialize } from "cookie";
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

    const csrfHeader = c.req.header("x-csrf-token");
    const cookieHeader = c.req.header("Cookie");

    if (!cookieHeader || !csrfHeader) {
      return c.json({ success: false, message: "CSRF token missing" }, 403);
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("=").map((s) => s.trim()))
    );

    const csrfCookie = cookies["csrf_token"];

    if (!csrfCookie || !verifyCsrfToken(csrfHeader, csrfCookie)) {
      return c.json({ success: false, message: "CSRF token invalid" }, 403);
    }

    return next();
  };
}
