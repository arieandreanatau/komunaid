'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, ArrowRight, Handshake, Compass, Rocket } from 'lucide-react';
import api from '@/lib/api';
import { CommunityCard } from '@/components/shared/community-card';
import { EventCard } from '@/components/shared/event-card';
import { GridSkeleton } from '@/components/shared/loading-state';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Compass,
    title: 'Discover',
    description: 'Temukan komunitas dan event yang sesuai dengan minat dan passion Anda.',
    color: 'bg-royal/10 text-royal',
  },
  {
    icon: Users,
    title: 'Connect',
    description: 'Jalin koneksi dengan ribuan individu, komunitas, dan organisasi.',
    color: 'bg-teal/10 text-teal',
  },
  {
    icon: Handshake,
    title: 'Collaborate',
    description: 'Berkolaborasi dalam proyek, event, dan inisiatif bersama.',
    color: 'bg-aqua/10 text-aqua',
  },
  {
    icon: Rocket,
    title: 'Grow',
    description: 'Kembangkan jaringan dan wawasan untuk pertumbuhan personal & profesional.',
    color: 'bg-navy/10 text-navy',
  },
];

const stats = [
  { label: 'Communities', value: '500+' },
  { label: 'Members', value: '50K+' },
  { label: 'Events', value: '1.2K+' },
  { label: 'Organizations', value: '200+' },
];

export default function LandingPage() {
  const { data: communitiesData, isLoading: communitiesLoading } = useQuery({
    queryKey: ['featured-communities'],
    queryFn: () => api.get('/communities?limit=3&sort=popular').then((r) => r.data.data),
    select: (data) => data?.items || data || [],
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => api.get('/events?limit=3&sort=upcoming').then((r) => r.data.data),
    select: (data) => data?.items || data || [],
  });

  const communities = Array.isArray(communitiesData) ? communitiesData : [];
  const events = Array.isArray(eventsData) ? eventsData : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-navy via-royal to-navy py-24 text-white lg:py-32">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-aqua blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-teal blur-3xl" />
          </div>
          <div className="container-komuna relative z-10 text-center">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl">
              Komuna<span className="text-aqua">ID</span>
            </h1>
            <p className="mb-4 text-lg font-medium text-aqua/90 lg:text-xl">
              Platform &bull; People &bull; Community &bull; Partnership
            </p>
            <p className="mb-10 text-3xl font-bold lg:text-4xl">Terhubung. Berdaya. Berdampak.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/communities" className="btn-teal !px-8 !py-3.5 text-base">
                Explore Communities
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Join Now
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container-komuna">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold text-gray-900">Kenapa KomunaID?</h2>
              <p className="text-gray-500">
                Solusi digital untuk memperkuat ekosistem komunitas Indonesia
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="card text-center transition-all hover:shadow-md"
                >
                  <div
                    className={cn(
                      'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl',
                      feature.color,
                    )}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-navy py-16">
          <div className="container-komuna">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-extrabold text-aqua lg:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Communities */}
        <section className="py-20">
          <div className="container-komuna">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">Komunitas Unggulan</h2>
                <p className="text-gray-500">Temukan komunitas yang aktif dan berkembang</p>
              </div>
              <Link
                href="/communities"
                className="hidden items-center gap-1 text-sm font-medium text-royal hover:underline sm:flex"
              >
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {communitiesLoading ? (
              <GridSkeleton count={3} />
            ) : communities.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {communities.map((c: any) => (
                  <CommunityCard
                    key={c.id}
                    slug={c.slug}
                    name={c.name}
                    description={c.description || ''}
                    logo={c.logo}
                    memberCount={c.memberCount || 0}
                    category={c.category?.name}
                    location={c.location}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <CommunityCard
                    key={i}
                    slug={`sample-community-${i}`}
                    name={`Komunitas Contoh ${i}`}
                    description="Komunitas ini merupakan contoh komunitas yang aktif di platform KomunaID."
                    memberCount={Math.floor(Math.random() * 5000) + 100}
                    category="Technology"
                  />
                ))}
              </div>
            )}
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/communities"
                className="inline-flex items-center gap-1 text-sm font-medium text-royal hover:underline"
              >
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="bg-gray-50 py-20">
          <div className="container-komuna">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">Event Mendatang</h2>
                <p className="text-gray-500">Jangan lewatkan event menarik dari komunitas Kami</p>
              </div>
              <Link
                href="/events"
                className="hidden items-center gap-1 text-sm font-medium text-royal hover:underline sm:flex"
              >
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {eventsLoading ? (
              <GridSkeleton count={3} />
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {events.map((e: any) => (
                  <EventCard
                    key={e.id}
                    slug={e.slug}
                    title={e.title}
                    description={e.description || ''}
                    banner={e.banner}
                    date={e.startDate || e.date}
                    location={e.location || 'Online'}
                    category={e.category?.name}
                    attendeeCount={e.attendeeCount || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <EventCard
                    key={i}
                    slug={`sample-event-${i}`}
                    title={`Event Contoh ${i}`}
                    description="Event ini merupakan contoh event yang diselenggarakan di platform KomunaID."
                    date={new Date(Date.now() + i * 7 * 86400000).toISOString()}
                    location="Jakarta, Indonesia"
                    category="Workshop"
                    attendeeCount={Math.floor(Math.random() * 200) + 20}
                  />
                ))}
              </div>
            )}
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-sm font-medium text-royal hover:underline"
              >
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container-komuna">
            <div className="rounded-3xl bg-gradient-to-r from-royal to-teal px-8 py-16 text-center text-white lg:px-16">
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Join KomunaID Today</h2>
              <p className="mb-8 max-w-2xl mx-auto text-white/80">
                Bergabunglah dengan ribuan komunitas dan individu di seluruh Indonesia. Mulai
                perjalanan Anda sekarang.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-royal shadow-sm transition-all hover:bg-gray-100"
                >
                  Daftar Gratis
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
