"use client";

import { CommunityDashboardRoute } from "../page";

export default function CommunityRequestsPage({ params }: { params: { communityId: string } }) {
  return <CommunityDashboardRoute tab="permintaan" communityIdOverride={params.communityId} />;
}
