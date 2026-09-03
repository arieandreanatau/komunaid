import { Context, Next } from "hono";

const DORMANT_FLAGS: Record<string, string> = {
  organization: process.env.ORGANIZATION_ENABLED || "true",
  brand: process.env.BRAND_ENABLED || "false",
  campaign: process.env.CAMPAIGN_ENABLED || "false",
  collaboration: process.env.COLLABORATION_ENABLED || "false",
  partnership: process.env.PARTNERSHIP_ENABLED || "false",
  csr: process.env.CSR_ENABLED || "false",
  marketplace: process.env.MARKETPLACE_ENABLED || "false",
  finance: process.env.FINANCE_ENABLED || "false",
  wallet: process.env.WALLET_ENABLED || "false",
  donation: process.env.DONATION_ENABLED || "false",
  chat: process.env.CHAT_ENABLED || "false",
  social_feed: process.env.SOCIAL_FEED_ENABLED || "false",
  gamification: process.env.GAMIFICATION_ENABLED || "false",
};

const MODULE_PATHS: Record<string, string[]> = {
  brand: ["/brands"],
  campaign: ["/campaigns"],
  collaboration: ["/collaborations", "/communities/:communityId/network"],
  partnership: ["/partnerships"],
  csr: ["/csr"],
  marketplace: ["/marketplace"],
  finance: ["/finance"],
  wallet: ["/wallet"],
  donation: ["/donations"],
  chat: ["/chat"],
  social_feed: ["/feed", "/posts"],
};

const DISABLED_RESPONSE = {
  success: false,
  code: "FEATURE_DISABLED",
  message: "This feature is not available in the current MVP.",
};

function normalizeApiPath(path: string): string {
  return path.startsWith("/api/v1") ? path.slice("/api/v1".length) : path;
}

function modulePathMatches(pathSegments: string[], modulePattern: string): boolean {
  const patternSegments = modulePattern.split("/").filter(Boolean);
  if (patternSegments.length === 0) return false;
  if (pathSegments[0] !== patternSegments[0]) return false;
  if (patternSegments.length > pathSegments.length) return false;
  return patternSegments.every((segment, index) => segment.startsWith(":") || segment === pathSegments[index]);
}

export function dormantFeatureGuard() {
  return async (c: Context, next: Next) => {
    const pathSegments = normalizeApiPath(c.req.path).split("/").filter(Boolean);

    for (const [module, patterns] of Object.entries(MODULE_PATHS)) {
      if (DORMANT_FLAGS[module] !== "true") {
        const matches = patterns.some((p) => modulePathMatches(pathSegments, p));
        if (matches) {
          return c.json(DISABLED_RESPONSE, 403);
        }
      }
    }

    await next();
  };
}

export function isFeatureEnabled(feature: string): boolean {
  return DORMANT_FLAGS[feature] === "true";
}
