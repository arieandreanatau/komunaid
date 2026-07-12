import { Context, Next } from "hono";
import { apiRateLimiter, rateLimitMiddleware } from "../services/rate-limiter";

export async function securityHeaders(c: Context, next: Next) {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");
  await next();
}

export const rateLimiter = rateLimitMiddleware(
  (ip: string) => apiRateLimiter(ip),
  {
    max: parseInt(process.env.API_RATE_MAX || "100", 10),
    errorMessage: "Terlalu banyak request. Coba lagi nanti.",
  }
);

export function requestSizeLimit(maxSize: string = "10mb") {
  return async (c: Context, next: Next) => {
    const method = c.req.method;
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return next();
    }
    const contentLength = c.req.header("content-length");
    const transferEncoding = c.req.header("transfer-encoding");
    if (!contentLength && !transferEncoding) {
      return c.json({ success: false, message: "Request tanpa Content-Length atau Transfer-Encoding" }, 411);
    }
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
