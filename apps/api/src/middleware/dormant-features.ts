import { Context, Next } from "hono";

const DORMANT_FLAGS: Record<string, string> = {
  organization: process.env.ORGANIZATION_ENABLED || "false",
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
  organization: ["/organizations"],
  brand: ["/brands"],
  campaign: ["/campaigns"],
  collaboration: ["/collaborations"],
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

export function dormantFeatureGuard() {
  return async (c: Context, next: Next) => {
    const path = c.req.path;

    for (const [module, paths] of Object.entries(MODULE_PATHS)) {
      if (paths.some((p) => path.startsWith(p))) {
        if (DORMANT_FLAGS[module] !== "true") {
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
