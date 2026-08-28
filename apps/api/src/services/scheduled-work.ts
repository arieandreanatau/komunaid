/**
 * Declares the platform's periodic background work as data, so it can run
 * under either deployment topology described in CLAUDE.md ("Two deployment
 * topologies for one Hono app"):
 *
 *  - Node standalone (`src/index.ts`): a long-lived `setInterval` calls
 *    `runAllJobs()` once an hour.
 *  - Vercel (serverless): there is no long-lived process, so nothing calls
 *    `setInterval`. Instead `routes/cron.ts` exposes an authenticated HTTP
 *    endpoint that an external scheduler (Vercel Cron, see the root
 *    `vercel.json`) invokes on the same cadence, and that route also calls
 *    `runAllJobs()`.
 *
 * Neither adapter contains job logic — they only decide *when* to call
 * `runAllJobs()`. Adding a new periodic job means adding one entry to
 * `SCHEDULED_JOBS`; neither adapter needs to change.
 */
import { createChildLogger } from "../lib/logger";
import { cleanupExpiredKeys } from "./rate-limiter";
import { cleanupExpiredTokens } from "./refresh-token";
import { rolloverStaleEvents } from "./event-rollover";

const log = createChildLogger("scheduled-work");

/** The cadence every current job runs at. Also the interval used by the Node adapter and the schedule declared in `vercel.json`. */
export const JOB_CADENCE_MS = 60 * 60 * 1000;

export interface ScheduledJob {
  /** Unique, stable identifier for the job (used in tests/logging). */
  name: string;
  /** How often this job is intended to run. Informational — enforcement is the caller's job (the Node interval, or the external scheduler hitting the cron route). */
  cadenceMs: number;
  /** Log message emitted (with `err`) when `run()` throws. */
  failureLogMessage: string;
  /** Executes the job once. Must reject rather than swallow errors so the runner can log and isolate them. */
  run: () => Promise<void>;
}

export const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    name: "rate-limiter-cleanup",
    cadenceMs: JOB_CADENCE_MS,
    failureLogMessage: "cleanup job failed",
    run: cleanupExpiredKeys,
  },
  {
    name: "refresh-token-cleanup",
    cadenceMs: JOB_CADENCE_MS,
    failureLogMessage: "cleanup job failed",
    run: async () => {
      await cleanupExpiredTokens();
    },
  },
  {
    name: "event-rollover",
    cadenceMs: JOB_CADENCE_MS,
    failureLogMessage: "event rollover job failed",
    run: async () => {
      const result = await rolloverStaleEvents();
      if (result.ongoing > 0 || result.completed > 0) {
        log.info(result, "event rollover applied");
      }
    },
  },
];

/**
 * Runs every registered job once, isolating failures per job: one job
 * throwing is logged and does not prevent the others from running.
 */
export async function runAllJobs(): Promise<void> {
  for (const job of SCHEDULED_JOBS) {
    try {
      await job.run();
    } catch (err) {
      log.error({ err }, job.failureLogMessage);
    }
  }
}
