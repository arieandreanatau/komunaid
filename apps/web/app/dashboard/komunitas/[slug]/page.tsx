"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CommunitySlugPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  useEffect(() => {
    api.get(`/communities/${params.slug}`).then(({ data }) => {
      const community = data.data || data;
      router.replace(`/dashboard/communities/${community.id}/overview`);
    }).catch(() => router.replace("/dashboard/communities"));
  }, [params.slug, router]);
  return <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">Membuka dashboard komunitas...</div>;
}
