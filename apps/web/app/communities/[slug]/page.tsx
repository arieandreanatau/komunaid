"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  logo: string;
  location: string;
  membershipType: string;
  status: string;
  owner: { id: string; name: string; avatar: string };
  memberCount: number;
  eventCount: number;
  membersPreview: Array<{ id: string; name: string; avatar: string; role: string }>;
  upcomingEvents: Array<{ id: string; title: string; eventDate: string }>;
  categories: Array<{ id: string; name: string }>;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunity();
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const { data } = await api.get(`/communities/${slug}`);
      setCommunity(data.community);
    } catch {
      console.error("Failed to fetch community");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-komuna-navy mb-2">Komunitas Tidak Ditemukan</h2>
          <Link href="/communities" className="text-komuna-blue hover:underline">
            Kembali ke Direktori Komunitas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-komuna-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl text-komuna-navy">KomunaID</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/communities" className="text-komuna-blue">Komunitas</Link>
            <Link href="/events" className="hover:text-komuna-blue">Event</Link>
            <Link href="/about" className="hover:text-komuna-blue">Tentang</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-komuna-navy hover:text-komuna-blue">Masuk</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy">Daftar</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center">
              <span className="text-white text-5xl font-bold">{community.name[0]}</span>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-komuna-navy">{community.name}</h1>
                  <p className="text-gray-500 text-sm mt-1">{community.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${community.membershipType === "OPEN" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {community.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{community.description}</p>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <span>{community.memberCount} anggota</span>
                <span>{community.eventCount} event</span>
                <span>Dibuat oleh {community.owner.name}</span>
              </div>

              {community.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {community.categories.map((cat) => (
                    <span key={cat.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <button className="w-full py-3 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors font-medium">
                Bergabung dengan Komunitas
              </button>
            </div>
          </div>

          {community.membersPreview.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Anggota</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {community.membersPreview.map((member) => (
                  <div key={member.id} className="text-center">
                    <div className="h-12 w-12 rounded-full bg-komuna-blue/10 flex items-center justify-center mx-auto mb-2">
                      <span className="text-komuna-blue font-bold">{member.name[0]}</span>
                    </div>
                    <p className="text-sm font-medium text-komuna-navy">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {community.upcomingEvents.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Event Mendatang</h2>
              <div className="space-y-3">
                {community.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-komuna-navy">{event.title}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(event.eventDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
