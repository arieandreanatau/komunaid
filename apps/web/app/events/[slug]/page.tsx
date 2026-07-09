"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  location: string;
  isOnline: boolean;
  eventDate: string;
  endDate: string;
  quota: number;
  registeredCount: number;
  community: { id: string; name: string; slug: string } | null;
  organization: { id: string; name: string; slug: string } | null;
  createdBy: { id: string; name: string; avatar: string };
  categories: Array<{ id: string; name: string }>;
}

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${slug}`);
      setEvent(data.event);
    } catch {
      console.error("Failed to fetch event");
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-komuna-navy mb-2">Event Tidak Ditemukan</h2>
          <Link href="/events" className="text-komuna-blue hover:underline">
            Kembali ke Direktori Event
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            <Link href="/communities" className="hover:text-komuna-blue">Komunitas</Link>
            <Link href="/events" className="text-komuna-blue">Event</Link>
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
            <div className="h-64 bg-gradient-to-br from-komuna-teal to-komuna-aqua flex items-center justify-center">
              <span className="text-white text-6xl font-bold">{event.title[0]}</span>
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-komuna-navy mb-2">{event.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{formatDate(event.eventDate)}</span>
                <span>{event.isOnline ? "Online" : event.location}</span>
                <span>{event.registeredCount}/{event.quota} peserta</span>
              </div>

              {event.community && (
                <div className="text-sm text-komuna-blue mb-4">
                  oleh <Link href={`/communities/${event.community.slug}`} className="underline">{event.community.name}</Link>
                </div>
              )}

              {event.organization && (
                <div className="text-sm text-komuna-blue mb-4">
                  oleh <Link href={`/organizations/${event.organization.slug}`} className="underline">{event.organization.name}</Link>
                </div>
              )}

              <p className="text-gray-600 mb-6 whitespace-pre-wrap">{event.description}</p>

              {event.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.categories.map((cat) => (
                    <span key={cat.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button className="flex-1 py-3 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors font-medium">
                  Daftar Event
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
