"use client";

import { CommunityDashboardRoute } from "../page";

export default function CommunityOverviewPage({ params }: { params: { communityId: string } }) {
  return <CommunityDashboardRoute tab="ringkasan" communityIdOverride={params.communityId} />;
}
