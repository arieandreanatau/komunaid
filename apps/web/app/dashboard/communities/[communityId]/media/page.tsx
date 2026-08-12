"use client";

import { CommunityDashboardRoute } from "../page";

export default function CommunityMediaPage({ params }: { params: { communityId: string } }) {
  return <CommunityDashboardRoute tab="media" communityIdOverride={params.communityId} />;
}
