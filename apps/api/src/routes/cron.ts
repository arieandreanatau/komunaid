import { Hono } from "hono";
import { timingSafeEqual } from "crypto";
import { runAllJobs } from "../services/scheduled-work";

// Vercel adapter for the scheduled-work module (see services/scheduled-work.ts).
// The Vercel topology has no long-lived process to hold a setInterval — see
// CLAUDE.md "Two deployment topologies for one Hono app" — so an external
// scheduler (Vercel Cron, declared in the root vercel.json) invokes this
// endpoint on the same cadence the Node standalone adapter uses internally.

export const cronRoutes = new Hono();

function isAuthorized(authHeader: string | undefined): boolean {
  const secret = process.env.CRON_SECRET;
  // Refuse all requests rather than run open when no secret is configured.
  if (!secret) return false;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  const provided = authHeader.slice("Bearer ".length);
  const providedBuf = Buffer.from(provided);
  const secretBuf = Buffer.from(secret);
  if (providedBuf.length !== secretBuf.length) return false;

  return timingSafeEqual(providedBuf, secretBuf);
}

cronRoutes.get("/scheduled-jobs", async (c) => {
  if (!isAuthorized(c.req.header("Authorization"))) {
    throw new Error("Unauthorized");
  }

  await runAllJobs();
  return c.json({ success: true });
});
