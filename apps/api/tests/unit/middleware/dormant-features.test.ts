import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";

describe("Dormant Features Middleware", () => {
  const DORMANT_ENV_KEYS = [
    "ORGANIZATION_ENABLED",
    "BRAND_ENABLED",
    "CAMPAIGN_ENABLED",
    "COLLABORATION_ENABLED",
    "PARTNERSHIP_ENABLED",
    "CSR_ENABLED",
    "MARKETPLACE_ENABLED",
    "FINANCE_ENABLED",
    "WALLET_ENABLED",
    "DONATION_ENABLED",
    "CHAT_ENABLED",
    "SOCIAL_FEED_ENABLED",
    "GAMIFICATION_ENABLED",
  ];

  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    vi.resetModules();
    for (const key of DORMANT_ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of DORMANT_ENV_KEYS) {
      if (savedEnv[key] !== undefined) {
        process.env[key] = savedEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  describe("isFeatureEnabled", () => {
    it("should return false for all features when env vars not set", async () => {
      const { isFeatureEnabled } = await import("../../../src/middleware/dormant-features");
      expect(isFeatureEnabled("organization")).toBe(true); // org in-scope V1
      expect(isFeatureEnabled("brand")).toBe(false);
      expect(isFeatureEnabled("campaign")).toBe(false);
      expect(isFeatureEnabled("collaboration")).toBe(false);
      expect(isFeatureEnabled("partnership")).toBe(false);
      expect(isFeatureEnabled("csr")).toBe(false);
      expect(isFeatureEnabled("marketplace")).toBe(false);
      expect(isFeatureEnabled("finance")).toBe(false);
      expect(isFeatureEnabled("wallet")).toBe(false);
      expect(isFeatureEnabled("donation")).toBe(false);
      expect(isFeatureEnabled("chat")).toBe(false);
      expect(isFeatureEnabled("social_feed")).toBe(false);
      expect(isFeatureEnabled("gamification")).toBe(false);
    });

    it("should return true when env var is 'true'", async () => {
      process.env.ORGANIZATION_ENABLED = "true";
      const { isFeatureEnabled } = await import("../../../src/middleware/dormant-features");
      expect(isFeatureEnabled("organization")).toBe(true);
    });

    it("should return false when env var is 'false'", async () => {
      process.env.ORGANIZATION_ENABLED = "false";
      const { isFeatureEnabled } = await import("../../../src/middleware/dormant-features");
      expect(isFeatureEnabled("organization")).toBe(false);
    });

    it("should return false for unknown feature", async () => {
      const { isFeatureEnabled } = await import("../../../src/middleware/dormant-features");
      expect(isFeatureEnabled("nonexistent")).toBe(false);
    });

    it("should return true for multiple enabled features", async () => {
      process.env.ORGANIZATION_ENABLED = "true";
      process.env.BRAND_ENABLED = "true";
      process.env.CHAT_ENABLED = "true";
      const { isFeatureEnabled } = await import("../../../src/middleware/dormant-features");
      expect(isFeatureEnabled("organization")).toBe(true);
      expect(isFeatureEnabled("brand")).toBe(true);
      expect(isFeatureEnabled("chat")).toBe(true);
      expect(isFeatureEnabled("campaign")).toBe(false);
    });

    it("should treat empty string as fallback enabled for organization (org in-scope V1)", async () => {
      process.env.ORGANIZATION_ENABLED = "";
      const { isFeatureEnabled } = await import("../../../src/middleware/dormant-features");
      expect(isFeatureEnabled("organization")).toBe(true);
    });

    it("should treat 'TRUE' as not 'true' (case-sensitive)", async () => {
      process.env.ORGANIZATION_ENABLED = "TRUE";
      const { isFeatureEnabled } = await import("../../../src/middleware/dormant-features");
      expect(isFeatureEnabled("organization")).toBe(false);
    });
  });

  describe("dormantFeatureGuard", () => {
    it("should allow /organizations by default (org in-scope V1, canonical §5.1)", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/organizations", (c) => c.json({ ok: true }));
      app.get("/organizations/123/members", (c) => c.json({ ok: true }));

      const res = await app.request("/organizations");
      expect(res.status).toBe(200);

      const nested = await app.request("/organizations/123/members");
      expect(nested.status).toBe(200);
    });

    it("should block /brands when BRAND_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/brands", (c) => c.json({ ok: true }));

      const res = await app.request("/brands");
      expect(res.status).toBe(403);
    });

    it("should block /campaigns when CAMPAIGN_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/campaigns", (c) => c.json({ ok: true }));

      const res = await app.request("/campaigns");
      expect(res.status).toBe(403);
    });

    it("should block /collaborations when COLLABORATION_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/collaborations", (c) => c.json({ ok: true }));

      const res = await app.request("/collaborations");
      expect(res.status).toBe(403);
    });

    it("should block /partnerships when PARTNERSHIP_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/partnerships", (c) => c.json({ ok: true }));

      const res = await app.request("/partnerships");
      expect(res.status).toBe(403);
    });

    it("should block /csr when CSR_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/csr", (c) => c.json({ ok: true }));

      const res = await app.request("/csr");
      expect(res.status).toBe(403);
    });

    it("should block /marketplace when MARKETPLACE_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/marketplace", (c) => c.json({ ok: true }));

      const res = await app.request("/marketplace");
      expect(res.status).toBe(403);
    });

    it("should block /wallet when WALLET_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/wallet", (c) => c.json({ ok: true }));

      const res = await app.request("/wallet");
      expect(res.status).toBe(403);
    });

    it("should block /donations when DONATION_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/donations", (c) => c.json({ ok: true }));

      const res = await app.request("/donations");
      expect(res.status).toBe(403);
    });

    it("should block /chat when CHAT_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/chat", (c) => c.json({ ok: true }));

      const res = await app.request("/chat");
      expect(res.status).toBe(403);
    });

    it("should allow /organizations when ORGANIZATION_ENABLED=true", async () => {
      process.env.ORGANIZATION_ENABLED = "true";
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/organizations", (c) => c.json({ ok: true }));

      const res = await app.request("/organizations");
      expect(res.status).toBe(200);
    });

    it("should allow /brands when BRAND_ENABLED=true", async () => {
      process.env.BRAND_ENABLED = "true";
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/brands", (c) => c.json({ ok: true }));

      const res = await app.request("/brands");
      expect(res.status).toBe(200);
    });

    it("should allow /campaigns when CAMPAIGN_ENABLED=true", async () => {
      process.env.CAMPAIGN_ENABLED = "true";
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/campaigns", (c) => c.json({ ok: true }));

      const res = await app.request("/campaigns");
      expect(res.status).toBe(200);
    });

    it("should allow /feed when SOCIAL_FEED_ENABLED=true", async () => {
      process.env.SOCIAL_FEED_ENABLED = "true";
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/feed", (c) => c.json({ ok: true }));

      const res = await app.request("/feed");
      expect(res.status).toBe(200);
    });

    it("should block /feed when SOCIAL_FEED_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/feed", (c) => c.json({ ok: true }));

      const res = await app.request("/feed");
      expect(res.status).toBe(403);
    });

    it("should block /posts when SOCIAL_FEED_ENABLED not set", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/posts", (c) => c.json({ ok: true }));

      const res = await app.request("/posts");
      expect(res.status).toBe(403);
    });

    it("should allow /posts when SOCIAL_FEED_ENABLED=true", async () => {
      process.env.SOCIAL_FEED_ENABLED = "true";
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/posts", (c) => c.json({ ok: true }));

      const res = await app.request("/posts");
      expect(res.status).toBe(200);
    });

    it("should allow non-dormant paths like /auth", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/auth/login", (c) => c.json({ ok: true }));

      const res = await app.request("/auth/login");
      expect(res.status).toBe(200);
    });

    it("should allow non-dormant paths like /users", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/users", (c) => c.json({ ok: true }));

      const res = await app.request("/users");
      expect(res.status).toBe(200);
    });

    it("should allow non-dormant paths like /health", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/health", (c) => c.json({ ok: true }));

      const res = await app.request("/health");
      expect(res.status).toBe(200);
    });

    it("should block nested paths under dormant modules", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/brands/123/members", (c) => c.json({ ok: true }));

      const res = await app.request("/brands/123/members");
      expect(res.status).toBe(403);
    });

    it("should block dormant module under /api/v1 prefix (real app mount)", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("/api/v1/*", dormantFeatureGuard());
      app.get("/api/v1/brands", (c) => c.json({ ok: true }));
      app.get("/api/v1/social-feed/feed", (c) => c.json({ ok: true }));

      const brandRes = await app.request("/api/v1/brands");
      expect(brandRes.status).toBe(403);

      const feedRes = await app.request("/api/v1/feed");
      expect(feedRes.status).toBe(403);
    });

    it("should allow enabled module under /api/v1 prefix", async () => {
      process.env.BRAND_ENABLED = "true";
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("/api/v1/*", dormantFeatureGuard());
      app.get("/api/v1/brands", (c) => c.json({ ok: true }));

      const res = await app.request("/api/v1/brands");
      expect(res.status).toBe(200);
    });

    it("should not false-match similar path prefixes (/organizations-evil)", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/organizations-evil", (c) => c.json({ ok: true }));
      app.get("/feeders", (c) => c.json({ ok: true }));

      expect((await app.request("/organizations-evil")).status).toBe(200);
      expect((await app.request("/feeders")).status).toBe(200);
    });

    it("should return FEATURE_DISABLED response body", async () => {
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/brands", (c) => c.json({ ok: true }));

      const res = await app.request("/brands");
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        code: "FEATURE_DISABLED",
        message: "This feature is not available in the current MVP.",
      });
    });

    it("should block when only some features are enabled", async () => {
      process.env.ORGANIZATION_ENABLED = "true";
      process.env.BRAND_ENABLED = "true";
      const { dormantFeatureGuard } = await import("../../../src/middleware/dormant-features");
      const app = new Hono();
      app.use("*", dormantFeatureGuard());
      app.get("/organizations", (c) => c.json({ ok: true }));
      app.get("/brands", (c) => c.json({ ok: true }));
      app.get("/campaigns", (c) => c.json({ ok: true }));

      const orgRes = await app.request("/organizations");
      expect(orgRes.status).toBe(200);

      const brandRes = await app.request("/brands");
      expect(brandRes.status).toBe(200);

      const campaignRes = await app.request("/campaigns");
      expect(campaignRes.status).toBe(403);
    });
  });
});
