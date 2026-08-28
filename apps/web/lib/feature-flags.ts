import { evaluateFlag } from "@komunaid/shared";

/**
 * Web adapter over the shared feature-flag registry (packages/shared/src/feature-flags.ts).
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` references textually at
 * build time, so each one MUST appear as a literal property access here --
 * a dynamic `process.env[key]` lookup would defeat that inlining and break
 * in production bundles. This is why each flag is its own line instead of
 * a loop over the registry's module names.
 *
 * Flags are defined as getters (not plain values) so a value change to
 * `process.env.NEXT_PUBLIC_*` between accesses -- as tests do -- is
 * reflected immediately without needing to re-import this module. In a
 * production build this makes no difference: Next has already replaced
 * the `process.env.NEXT_PUBLIC_*` text with a literal at build time, so
 * every access simply re-reads that same baked-in constant.
 *
 * Defaults mirror the server-side registry: everything is off except
 * `organization`, which is in-scope for V1 and defaults to enabled (see
 * apps/api/src/middleware/dormant-features.ts and CLAUDE.md).
 */
export const featureFlags = {
  get organization() {
    return evaluateFlag("organization", process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED);
  },
  get brand() {
    return evaluateFlag("brand", process.env.NEXT_PUBLIC_BRAND_ENABLED);
  },
  get campaign() {
    return evaluateFlag("campaign", process.env.NEXT_PUBLIC_CAMPAIGN_ENABLED);
  },
  get collaboration() {
    return evaluateFlag("collaboration", process.env.NEXT_PUBLIC_COLLABORATION_ENABLED);
  },
  get partnership() {
    return evaluateFlag("partnership", process.env.NEXT_PUBLIC_PARTNERSHIP_ENABLED);
  },
  get csr() {
    return evaluateFlag("csr", process.env.NEXT_PUBLIC_CSR_ENABLED);
  },
  get marketplace() {
    return evaluateFlag("marketplace", process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED);
  },
  get finance() {
    return evaluateFlag("finance", process.env.NEXT_PUBLIC_FINANCE_ENABLED);
  },
  get wallet() {
    return evaluateFlag("wallet", process.env.NEXT_PUBLIC_WALLET_ENABLED);
  },
  get donation() {
    return evaluateFlag("donation", process.env.NEXT_PUBLIC_DONATION_ENABLED);
  },
  get chat() {
    return evaluateFlag("chat", process.env.NEXT_PUBLIC_CHAT_ENABLED);
  },
  get socialFeed() {
    return evaluateFlag("social_feed", process.env.NEXT_PUBLIC_SOCIAL_FEED_ENABLED);
  },
  get gamification() {
    return evaluateFlag("gamification", process.env.NEXT_PUBLIC_GAMIFICATION_ENABLED);
  },
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
