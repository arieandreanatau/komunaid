"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface UserCommunity {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: string;
  status: string;
  leftAt?: string | null;
}

type CommunityTab = "created" | "followed" | "past";

interface UserProfile {
  communities?: UserCommunity[];
  createdCommunities?: UserCommunity[];
  followedCommunities?: UserCommunity[];
  pastCommunities?: UserCommunity[];
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Pemilik",
  ADMIN: "Admin",
  EVENT_MANAGER: "Manajer Event",
  MEMBER: "Anggota",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-amber-100 text-amber-700",
  EVENT_MANAGER: "bg-teal-100 text-teal-700",
  MEMBER: "bg-gray-100 text-gray-600",
};

export default function MyCommunitiesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<CommunityTab>("created");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", "communities"],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return (res.data.data?.user || res.data.user) as UserProfile;
    },
  });

  const communities: UserCommunity[] = profile?.communities || [];
  const communityGroups: Record<CommunityTab, UserCommunity[]> = {
    created: profile?.createdCommunities || communities.filter((community) => community.role === "OWNER"),
    followed: profile?.followedCommunities || communities.filter((community) => community.role !== "OWNER"),
    past: profile?.pastCommunities || [],
  };
  const filtered = communityGroups[tab];
  const tabs: { id: CommunityTab; label: string }[] = [
    { id: "created", label: "Komunitas Yang Saya Buat" },
    { id: "followed", label: "Komunitas Yang Saya Ikuti" },
    { id: "past", label: "Komunitas Yang Pernah Saya Ikuti" },
  ];
  const emptyMessages: Record<CommunityTab, string> = {
    created: "Anda belum membuat komunitas",
    followed: "Anda belum mengikuti komunitas",
    past: "Belum ada riwayat komunitas yang pernah diikuti",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Komunitas Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau komunitas Anda</p>
        </div>
        <Link
          href="/communities/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Komunitas
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="tablist" aria-label="Kategori komunitas saya">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              tab === item.id
                ? "border-komuna-blue bg-komuna-blue text-white shadow-sm"
                : "border-gray-200 bg-white text-komuna-navy hover:border-komuna-blue/40 hover:shadow-sm"
            }`}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className={`mt-2 block text-2xl font-bold ${tab === item.id ? "text-white" : "text-komuna-blue"}`}>
              {communityGroups[item.id].length}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Memuat komunitas...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500">{emptyMessages[tab]}</p>
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
          >
            Jelajahi Komunitas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={tab === "created" ? `/dashboard/communities/${c.id}` : `/communities/${c.slug}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{c.name[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-komuna-navy truncate">{c.name}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[c.role] || ""}`}>
                    {ROLE_LABELS[c.role] || c.role}
                  </span>
                  {c.status !== "APPROVED" && (
                    <span className="inline-block ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      {c.status}
                    </span>
                  )}
                  {tab === "past" && c.leftAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      Keluar {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(c.leftAt))}
                    </p>
                  )}
                </div>
                <svg className="h-5 w-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
