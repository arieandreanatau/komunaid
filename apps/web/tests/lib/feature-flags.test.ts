import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FeatureFlag } from "../../lib/feature-flags";

describe("feature-flags", () => {
  const allEnvVars = [
    "NEXT_PUBLIC_ORGANIZATION_ENABLED",
    "NEXT_PUBLIC_BRAND_ENABLED",
    "NEXT_PUBLIC_CAMPAIGN_ENABLED",
    "NEXT_PUBLIC_COLLABORATION_ENABLED",
    "NEXT_PUBLIC_PARTNERSHIP_ENABLED",
    "NEXT_PUBLIC_CSR_ENABLED",
    "NEXT_PUBLIC_MARKETPLACE_ENABLED",
    "NEXT_PUBLIC_FINANCE_ENABLED",
    "NEXT_PUBLIC_WALLET_ENABLED",
    "NEXT_PUBLIC_DONATION_ENABLED",
    "NEXT_PUBLIC_CHAT_ENABLED",
    "NEXT_PUBLIC_SOCIAL_FEED_ENABLED",
    "NEXT_PUBLIC_GAMIFICATION_ENABLED",
  ];

  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const key of allEnvVars) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("all flags default to false when env vars not set", async () => {
    const { featureFlags } = await import("../../lib/feature-flags");
    for (const key of Object.keys(featureFlags)) {
      expect(featureFlags[key as FeatureFlag]).toBe(false);
    }
  });

  it("isFeatureEnabled returns false for unset flags", async () => {
    const { isFeatureEnabled } = await import("../../lib/feature-flags");
    const flags: FeatureFlag[] = [
      "organization", "brand", "campaign", "collaboration",
      "partnership", "csr", "marketplace", "finance",
      "wallet", "donation", "chat", "socialFeed", "gamification",
    ];
    for (const flag of flags) {
      expect(isFeatureEnabled(flag)).toBe(false);
    }
  });

  it("returns true for flags with env var set to 'true'", async () => {
    process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED = "true";
    process.env.NEXT_PUBLIC_CHAT_ENABLED = "true";

    const { featureFlags, isFeatureEnabled } = await import("../../lib/feature-flags");
    expect(featureFlags.organization).toBe(true);
    expect(featureFlags.chat).toBe(true);
    expect(isFeatureEnabled("organization")).toBe(true);
    expect(isFeatureEnabled("chat")).toBe(true);

    expect(featureFlags.brand).toBe(false);
    expect(isFeatureEnabled("brand")).toBe(false);
  });

  it("returns false for flags with env var set to non-'true' value", async () => {
    process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED = "false";
    process.env.NEXT_PUBLIC_BRAND_ENABLED = "1";

    const { featureFlags } = await import("../../lib/feature-flags");
    expect(featureFlags.organization).toBe(false);
    expect(featureFlags.brand).toBe(false);
  });

  it("featureFlags object has exactly 13 keys", async () => {
    const { featureFlags } = await import("../../lib/feature-flags");
    expect(Object.keys(featureFlags)).toHaveLength(13);
  });

  it("FeatureFlag type matches all keys", async () => {
    const { featureFlags } = await import("../../lib/feature-flags");
    const expectedKeys: FeatureFlag[] = [
      "organization", "brand", "campaign", "collaboration",
      "partnership", "csr", "marketplace", "finance",
      "wallet", "donation", "chat", "socialFeed", "gamification",
    ];
    const keys = Object.keys(featureFlags) as FeatureFlag[];
    expect(keys.sort()).toEqual(expectedKeys.sort());
  });

  it("isFeatureEnabled is a function", async () => {
    const { isFeatureEnabled } = await import("../../lib/feature-flags");
    expect(typeof isFeatureEnabled).toBe("function");
  });

  it("isFeatureEnabled returns a boolean", async () => {
    const { isFeatureEnabled } = await import("../../lib/feature-flags");
    expect(typeof isFeatureEnabled("organization")).toBe("boolean");
  });
});
