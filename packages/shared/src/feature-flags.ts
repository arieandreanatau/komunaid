/**
 * Single source of truth for KomunaID's dormant-feature flags.
 *
 * Every module gets exactly one entry that pairs its API path pattern(s)
 * with its default state. The `paths` tuple is required to have at least
 * one entry, so a module without a path pattern is a TypeScript error
 * instead of a silently-inert flag (see apps/api dormant-features guard,
 * which used to have `organization` and `gamification` flags with no
 * matching path pattern at all).
 *
 * This module is plain data + pure functions on purpose: it must stay
 * usable from both the Node/Hono API and the Next.js web app, including
 * the Edge runtime, so it deliberately does NOT read `process.env` itself.
 * Each adapter (apps/api/src/middleware/dormant-features.ts,
 * apps/web/lib/feature-flags.ts) is responsible for sourcing its own env
 * values and handing them to `evaluateFlag`/`evaluateFlags` below. This
 * matters in particular for the web adapter, where Next.js inlines
 * `process.env.NEXT_PUBLIC_*` references textually at build time -- a
 * dynamic `env[key]` lookup here would defeat that inlining.
 */

export interface FeatureFlagDefinition {
  /** API path patterns (relative to `/api/v1`) this module owns. At least one is required. */
  readonly paths: readonly [string, ...string[]];
  /** Default state when no env override is supplied. */
  readonly default: boolean;
}

export const FEATURE_FLAG_REGISTRY = {
  // In-scope for V1 (canonical §5.1) -> enabled by default. Mounted at
  // `api.route("/organizations", organizationRoutes)` in apps/api/src/app.ts.
  organization: { paths: ["/organizations"], default: true },
  brand: { paths: ["/brands"], default: false },
  campaign: { paths: ["/campaigns"], default: false },
  collaboration: { paths: ["/collaborations"], default: false },
  partnership: { paths: ["/partnerships"], default: false },
  csr: { paths: ["/csr"], default: false },
  marketplace: { paths: ["/marketplace"], default: false },
  finance: { paths: ["/finance"], default: false },
  wallet: { paths: ["/wallet"], default: false },
  donation: { paths: ["/donations"], default: false },
  chat: { paths: ["/chat"], default: false },
  social_feed: { paths: ["/feed", "/posts"], default: false },
  // No routes are mounted for this module anywhere in apps/api/src/app.ts
  // yet -- this is a placeholder path so the flag is structurally capable
  // of guarding something once gamification routes exist.
  gamification: { paths: ["/gamification"], default: false },
} satisfies Record<string, FeatureFlagDefinition>;

export type FeatureFlagModule = keyof typeof FEATURE_FLAG_REGISTRY;

export function getFeatureFlagPaths(module: FeatureFlagModule): readonly string[] {
  return FEATURE_FLAG_REGISTRY[module].paths;
}

export function getFeatureFlagDefault(module: FeatureFlagModule): boolean {
  return FEATURE_FLAG_REGISTRY[module].default;
}

/**
 * Evaluate a single flag given a raw env string value. Unset/empty falls
 * back to the module's registry default; any other value is only "on"
 * when it is exactly the string "true" (case-sensitive), matching the
 * historical behaviour of both adapters.
 */
export function evaluateFlag(module: FeatureFlagModule, rawValue: string | undefined): boolean {
  if (rawValue === undefined || rawValue === "") {
    return FEATURE_FLAG_REGISTRY[module].default;
  }
  return rawValue === "true";
}

/**
 * Evaluate every registered flag against a supplied env record. Intended
 * for adapters (like the API's Node process) that can read arbitrary env
 * keys dynamically at runtime without breaking build-time inlining.
 */
export function evaluateFlags(
  env: Partial<Record<FeatureFlagModule, string | undefined>>
): Record<FeatureFlagModule, boolean> {
  const result = {} as Record<FeatureFlagModule, boolean>;
  for (const module of Object.keys(FEATURE_FLAG_REGISTRY) as FeatureFlagModule[]) {
    result[module] = evaluateFlag(module, env[module]);
  }
  return result;
}
