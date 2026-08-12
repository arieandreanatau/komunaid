"use client";

import { CommunityDashboardRoute } from "../page";

export default function CommunityInsightsPage({ params }: { params: { communityId: string } }) {
  return <CommunityDashboardRoute tab="insight" communityIdOverride={params.communityId} />;
}
