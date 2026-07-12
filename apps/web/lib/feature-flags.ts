export const featureFlags = {
  organization: process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED === "true",
  brand: process.env.NEXT_PUBLIC_BRAND_ENABLED === "true",
  campaign: process.env.NEXT_PUBLIC_CAMPAIGN_ENABLED === "true",
  collaboration: process.env.NEXT_PUBLIC_COLLABORATION_ENABLED === "true",
  partnership: process.env.NEXT_PUBLIC_PARTNERSHIP_ENABLED === "true",
  csr: process.env.NEXT_PUBLIC_CSR_ENABLED === "true",
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED === "true",
  finance: process.env.NEXT_PUBLIC_FINANCE_ENABLED === "true",
  wallet: process.env.NEXT_PUBLIC_WALLET_ENABLED === "true",
  donation: process.env.NEXT_PUBLIC_DONATION_ENABLED === "true",
  chat: process.env.NEXT_PUBLIC_CHAT_ENABLED === "true",
  socialFeed: process.env.NEXT_PUBLIC_SOCIAL_FEED_ENABLED === "true",
  gamification: process.env.NEXT_PUBLIC_GAMIFICATION_ENABLED === "true",
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
