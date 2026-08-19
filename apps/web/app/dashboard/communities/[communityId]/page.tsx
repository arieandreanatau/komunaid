"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CommunityDashboardIndexPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (communityId) router.replace(`/dashboard/communities/${communityId}/overview`);
  }, [communityId, router]);

  return <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">Membuka dashboard komunitas...</div>;
}
