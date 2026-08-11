"use client";

import { useParams } from "next/navigation";
import CommunityMembersPage from "@/app/dashboard/communities/[communityId]/page";

export default function MembersPage() {
  const params = useParams<{ slug: string }>();
  return <CommunityMembersPage initialTab="anggota" communitySlug={params.slug} />;
}
