"use client";

import { CommunityDashboardRoute } from "../page";

export default function CommunitySettingsPage({ params }: { params: { communityId: string } }) {
  return <CommunityDashboardRoute tab="pengaturan" communityIdOverride={params.communityId} />;
}
