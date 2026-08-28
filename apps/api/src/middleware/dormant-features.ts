import { Context, Next } from "hono";
import { FEATURE_FLAG_REGISTRY, evaluateFlag, type FeatureFlagModule } from "@komunaid/shared";

const DISABLED_RESPONSE = {
  success: false,
  code: "FEATURE_DISABLED",
  message: "This feature is not available in the current MVP.",
};

function envKeyFor(module: FeatureFlagModule): string {
  return `${module.toUpperCase()}_ENABLED`;
}

/**
 * Re-read process.env on every call (cheap: 13 entries) rather than
 * caching at module load, so a test (or a future runtime env change)
 * doesn't require re-importing this module to take effect.
 */
function resolveFlagState(): Record<FeatureFlagModule, boolean> {
  const state = {} as Record<FeatureFlagModule, boolean>;
  for (const module of Object.keys(FEATURE_FLAG_REGISTRY) as FeatureFlagModule[]) {
    state[module] = evaluateFlag(module, process.env[envKeyFor(module)]);
  }
  return state;
}

function normalizeApiPath(path: string): string {
  return path.startsWith("/api/v1") ? path.slice("/api/v1".length) : path;
}

function modulePathMatches(pathSegments: string[], modulePattern: string): boolean {
  const patternSegments = modulePattern.split("/").filter(Boolean);
  if (patternSegments.length === 0) return false;
  if (pathSegments[0] !== patternSegments[0]) return false;
  if (patternSegments.length > pathSegments.length) return false;
  return pathSegments.slice(0, patternSegments.length).join("/") === patternSegments.join("/");
}

export function dormantFeatureGuard() {
  return async (c: Context, next: Next) => {
    const pathSegments = normalizeApiPath(c.req.path).split("/").filter(Boolean);
    const flagState = resolveFlagState();

    for (const [module, definition] of Object.entries(FEATURE_FLAG_REGISTRY) as Array<
      [FeatureFlagModule, (typeof FEATURE_FLAG_REGISTRY)[FeatureFlagModule]]
    >) {
      if (!flagState[module]) {
        const matches = definition.paths.some((p) => modulePathMatches(pathSegments, p));
        if (matches) {
          return c.json(DISABLED_RESPONSE, 403);
        }
      }
    }

    await next();
  };
}

export function isFeatureEnabled(feature: string): boolean {
  const flagState = resolveFlagState();
  return flagState[feature as FeatureFlagModule] === true;
}
