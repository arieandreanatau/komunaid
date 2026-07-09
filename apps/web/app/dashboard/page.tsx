"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return res.data.data?.user || res.data.user;
    },
  });

  const profileData = profile || user;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Selamat datang, {profileData?.name || "Member"}!</h1>
        <p className="text-white/80 mt-1">Kelola profil, komunitas, dan aktivitas Anda dari sini.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-komuna-blue/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-komuna-navy">{profileData?.communities?.length || 0}</p>
              <p className="text-sm text-gray-500">Komunitas Diikuti</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-komuna-teal/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-komuna-navy">{profileData?.events?.length || 0}</p>
              <p className="text-sm text-gray-500">Event Terdaftar</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-komuna-aqua/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-komuna-aqua" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-komuna-navy">{profileData?.unreadNotifications || 0}</p>
              <p className="text-sm text-gray-500">Notifikasi Baru</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-komuna-navy mb-4">Profile Summary</h2>
        <div className="flex items-start gap-4">
          {profileData?.avatar ? (
            <img src={profileData.avatar} alt={profileData.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-komuna-blue flex items-center justify-center text-white text-xl font-bold">
              {profileData?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{profileData?.name}</h3>
            <p className="text-sm text-gray-500">@{profileData?.username}</p>
            <p className="text-sm text-gray-400">{profileData?.email}</p>
            {profileData?.bio && <p className="text-sm text-gray-600 mt-1">{profileData.bio}</p>}
            <div className="flex items-center gap-2 mt-2">
              {profileData?.roles?.map((role: string) => (
                <span key={role} className="px-2 py-0.5 text-xs font-medium bg-komuna-blue/10 text-komuna-blue rounded-full">
                  {role}
                </span>
              ))}
            </div>
          </div>
          <Link href="/dashboard/profile" className="text-sm text-komuna-blue hover:underline font-medium">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Joined Communities (placeholder if no data) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-komuna-navy">Komunitas yang Diikuti</h2>
          <Link href="/communities" className="text-sm text-komuna-blue hover:underline">
            Jelajahi
          </Link>
        </div>
        {profileData?.communities && profileData.communities.length > 0 ? (
          <div className="space-y-3">
            {profileData.communities.slice(0, 5).map((community: { id: string; name: string; slug: string; logo?: string }) => (
              <Link key={community.id} href={`/communities/${community.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {community.logo ? (
                  <img src={community.logo} alt={community.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-komuna-teal/10 flex items-center justify-center text-komuna-teal font-semibold text-sm">
                    {community.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-gray-900">{community.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-sm">Belum bergabung dengan komunitas manapun.</p>
            <Link href="/communities" className="inline-block mt-2 text-sm text-komuna-blue hover:underline font-medium">
              Jelajahi Komunitas
            </Link>
          </div>
        )}
      </div>

      {/* Registered Events (placeholder if no data) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-komuna-navy">Event Terdaftar</h2>
          <Link href="/events" className="text-sm text-komuna-blue hover:underline">
            Jelajahi
          </Link>
        </div>
        {profileData?.events && profileData.events.length > 0 ? (
          <div className="space-y-3">
            {profileData.events.slice(0, 5).map((event: { id: string; title: string; slug: string; coverImage?: string; eventDate: string; registrationStatus: string }) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-komuna-aqua/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-komuna-aqua" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{event.title}</span>
                  <p className="text-xs text-gray-500">{new Date(event.eventDate).toLocaleDateString("id-ID")}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  event.registrationStatus === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {event.registrationStatus}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-sm">Belum terdaftar di event manapun.</p>
            <Link href="/events" className="inline-block mt-2 text-sm text-komuna-blue hover:underline font-medium">
              Jelajahi Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
