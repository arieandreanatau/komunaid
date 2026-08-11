"use client";

import CommunityDashboardPage from "@/app/dashboard/communities/[communityId]/page";
import { useParams } from "next/navigation";

export default function CommunitySlugPage() {
  const params = useParams<{ slug: string }>();
  return <CommunityDashboardPage communitySlug={params.slug} />;
}
