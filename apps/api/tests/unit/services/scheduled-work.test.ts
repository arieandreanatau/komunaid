import { describe, it, expect, vi, beforeEach } from "vitest";

const cleanupExpiredKeys = vi.fn(async () => {});
const cleanupExpiredTokens = vi.fn(async () => 0);
const rolloverStaleEvents = vi.fn(async () => ({ ongoing: 0, completed: 0 }));

vi.mock("../../../src/services/rate-limiter", () => ({
  cleanupExpiredKeys: () => cleanupExpiredKeys(),
}));

vi.mock("../../../src/services/refresh-token", () => ({
  cleanupExpiredTokens: () => cleanupExpiredTokens(),
}));

vi.mock("../../../src/services/event-rollover", () => ({
  rolloverStaleEvents: () => rolloverStaleEvents(),
}));

import { SCHEDULED_JOBS, runAllJobs } from "../../../src/services/scheduled-work";

describe("scheduled-work", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanupExpiredKeys.mockImplementation(async () => {});
    cleanupExpiredTokens.mockImplementation(async () => 0);
    rolloverStaleEvents.mockImplementation(async () => ({ ongoing: 0, completed: 0 }));
  });

  describe("SCHEDULED_JOBS registry", () => {
    it("lists the expected jobs", () => {
      const names = SCHEDULED_JOBS.map((job) => job.name);
      expect(names).toEqual([
        "rate-limiter-cleanup",
        "refresh-token-cleanup",
        "event-rollover",
      ]);
    });

    it("gives every job a name, cadence, failure message and handler", () => {
      for (const job of SCHEDULED_JOBS) {
        expect(typeof job.name).toBe("string");
        expect(job.name.length).toBeGreaterThan(0);
        expect(typeof job.cadenceMs).toBe("number");
        expect(job.cadenceMs).toBeGreaterThan(0);
        expect(typeof job.failureLogMessage).toBe("string");
        expect(typeof job.run).toBe("function");
      }
    });
  });

  describe("runAllJobs", () => {
    it("runs all registered jobs", async () => {
      await runAllJobs();

      expect(cleanupExpiredKeys).toHaveBeenCalledTimes(1);
      expect(cleanupExpiredTokens).toHaveBeenCalledTimes(1);
      expect(rolloverStaleEvents).toHaveBeenCalledTimes(1);
    });

    it("isolates a failure in the rate-limiter cleanup job — the others still run", async () => {
      cleanupExpiredKeys.mockRejectedValueOnce(new Error("redis down"));

      await expect(runAllJobs()).resolves.toBeUndefined();

      expect(cleanupExpiredKeys).toHaveBeenCalledTimes(1);
      expect(cleanupExpiredTokens).toHaveBeenCalledTimes(1);
      expect(rolloverStaleEvents).toHaveBeenCalledTimes(1);
    });

    it("isolates a failure in the refresh-token cleanup job — the others still run", async () => {
      cleanupExpiredTokens.mockRejectedValueOnce(new Error("db down"));

      await expect(runAllJobs()).resolves.toBeUndefined();

      expect(cleanupExpiredKeys).toHaveBeenCalledTimes(1);
      expect(cleanupExpiredTokens).toHaveBeenCalledTimes(1);
      expect(rolloverStaleEvents).toHaveBeenCalledTimes(1);
    });

    it("isolates a failure in the event rollover job — the others still run", async () => {
      rolloverStaleEvents.mockRejectedValueOnce(new Error("db down"));

      await expect(runAllJobs()).resolves.toBeUndefined();

      expect(cleanupExpiredKeys).toHaveBeenCalledTimes(1);
      expect(cleanupExpiredTokens).toHaveBeenCalledTimes(1);
      expect(rolloverStaleEvents).toHaveBeenCalledTimes(1);
    });

    it("does not throw even if every job fails", async () => {
      cleanupExpiredKeys.mockRejectedValueOnce(new Error("a"));
      cleanupExpiredTokens.mockRejectedValueOnce(new Error("b"));
      rolloverStaleEvents.mockRejectedValueOnce(new Error("c"));

      await expect(runAllJobs()).resolves.toBeUndefined();
    });
  });
});
