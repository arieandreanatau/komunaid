"use client";

import { useParams } from "next/navigation";
import CommunityDashboardPage from "@/app/dashboard/communities/[communityId]/page";

export default function SettingsPage() {
  const params = useParams<{ slug: string }>();
  return <CommunityDashboardPage initialTab="pengaturan" communitySlug={params.slug} />;
}
