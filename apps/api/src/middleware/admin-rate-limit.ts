import { Context, Next } from "hono";
import { adminMutationRateLimiter as redisAdminRateLimiter } from "../services/rate-limiter";

const ADMIN_MUTATION_MAX = parseInt(process.env.ADMIN_MUTATION_RATE_MAX || "30", 10);

export function adminMutationRateLimiter() {
  return async (c: Context, next: Next) => {
    const authUser = c.get("user");
    if (!authUser) return next();

    const result = await redisAdminRateLimiter(authUser.id);

    c.header("X-RateLimit-Limit", String(ADMIN_MUTATION_MAX));
    c.header("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
    c.header("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

    if (!result.allowed) {
      if (result.retryAfter) {
        c.header("Retry-After", String(result.retryAfter));
      }
      return c.json(
        { success: false, message: "Terlalu banyak operasi mutasi. Coba lagi nanti." },
        429
      );
    }

    return next();
  };
}
