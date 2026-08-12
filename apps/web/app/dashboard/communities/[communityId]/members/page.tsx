"use client";

import { CommunityDashboardRoute } from "../page";

export default function CommunityMembersPage({ params }: { params: { communityId: string } }) {
  return <CommunityDashboardRoute tab="anggota" communityIdOverride={params.communityId} />;
}
