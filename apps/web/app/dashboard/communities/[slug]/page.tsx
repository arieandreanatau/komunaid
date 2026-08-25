"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CommunityDashboardIndexPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    if (slug) router.replace(`/dashboard/communities/${slug}/overview`);
  }, [slug, router]);

  return <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">Membuka dashboard komunitas...</div>;
}
