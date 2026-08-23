"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";

interface Category {
  id: string;
  name: string;
  type?: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  logo: string | null;
  location: string | null;
  memberCount: number;
  eventCount: number;
  categories: { id: string; name: string }[];
}

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string | null;
  coverImage: string | null;
  location: string | null;
  locationType: string;
  community?: { name: string } | null;
}

interface VolunteerItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  activityStartDate: string | null;
  event?: { title: string; location: string | null } | null;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Teknologi: "Komunitas pengembang, desainer, dan penggiat teknologi digital.",
  Pendidikan: "Komunitas belajar, mentoring, dan pengembangan kapabilitas.",
  Sosial: "Komunitas yang fokus pada kesejahteraan dan kepedulian sosial.",
  Olahraga: "Komunitas olahraga, kebugaran, dan aktivitas fisik bersama.",
  Kreatif: "Komunitas seni, desain, konten, dan ekspresi kreatif lainnya.",
  Lingkungan: "Komunitas yang peduli dan bergerak untuk lingkungan hidup.",
};

function formatDate(value: string | null) {
  if (!value) return "Tanggal menyusul";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function CategoryCard({ category, count, active, onClick }: { category: Category; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group rounded-2xl border p-6 text-left transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
        active ? "border-komuna-forest bg-komuna-forest text-white shadow-xl" : "border-komuna-forest/10 bg-white hover:border-komuna-forest"
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-komuna-coral ${active ? "bg-white/15" : "bg-komuna-soft"}`} aria-hidden="true">
        {category.name.charAt(0)}
      </div>
      <h3 className={`mt-5 text-lg font-bold ${active ? "text-white" : "text-komuna-dark"}`}>{category.name}</h3>
      <p className={`mt-1 text-sm leading-6 ${active ? "text-white/75" : "text-komuna-dark/65"}`}>
        {CATEGORY_DESCRIPTIONS[category.name] || "Temukan komunitas yang relevan dengan minatmu di kategori ini."}
      </p>
      <span className={`mt-4 inline-block text-sm font-bold ${active ? "text-white" : "text-komuna-forest"}`}>
        {count} komunitas
      </span>
    </button>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [categoryRes, communityRes, eventRes, volunteerRes] = await Promise.allSettled([
        api.get("/categories", { params: { type: "COMMUNITY" } }),
        api.get("/communities", { params: { limit: 100, orderBy: "memberCount", sort: "desc" } }),
        api.get("/events/popular/upcoming"),
        api.get("/volunteer-programs", { params: { limit: 6, status: "REGISTRATION_OPEN" } }),
      ]);
      if (cancelled) return;

      const read = (r: PromiseSettledResult<{ data: { data?: unknown } }>) => (r.status === "fulfilled" ? (r.value.data.data ?? []) : []);
      const categoriesData = read(categoryRes as PromiseSettledResult<{ data: { data?: unknown } }>) as Category[];
      const communityCategories = categoriesData.filter((cat) => !cat.type || cat.type === "COMMUNITY");

      setCategories(communityCategories);
      setCommunities(read(communityRes as PromiseSettledResult<{ data: { data?: unknown } }>) as Community[]);
      setEvents(read(eventRes as PromiseSettledResult<{ data: { data?: unknown } }>) as EventItem[]);
      setVolunteers(read(volunteerRes as PromiseSettledResult<{ data: { data?: unknown } }>) as VolunteerItem[]);
      if (communityCategories[0]) setActiveCategory(communityCategories[0].id);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const activeCategories = categories.filter((c) => c.id === activeCategory).map((c) => c.name);
  const visibleCommunities = communities
    .filter((c) => !activeCategory || c.categories.some((cat) => cat.id === activeCategory))
    .slice(0, 6);

  const countFor = useCallback((id: string) => communities.filter((c) => c.categories.some((cat) => cat.id === id)).length, [communities]);

  return (
    <div className="min-h-screen bg-komuna-cream text-komuna-dark">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-komuna-coral focus:px-4 focus:py-2 focus:font-semibold focus:text-white">
        Langsung ke konten utama
      </a>
      <JsonLd type="website" />
      <Header />

      <main id="content">
        <section className="relative isolate overflow-hidden bg-komuna-soft px-4 py-14 sm:py-20">
          <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-komuna-coral/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Kategori</p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
              Jelajahi komunitas berdasarkan minatmu
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-komuna-dark/65">
              Pilih kategori untuk menemukan komunitas, kegiatan, dan kesempatan volunteer yang relevan dengan apa yang kamu minati.
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-komuna-forest/10 bg-white p-6 animate-pulse">
                    <div className="h-12 w-12 rounded-xl bg-komuna-soft" />
                    <div className="mt-5 h-5 w-1/2 rounded bg-komuna-soft" />
                    <div className="mt-3 h-4 w-full rounded bg-komuna-soft" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-komuna-soft" />
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    count={countFor(category.id)}
                    active={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-10 text-center">
                <p className="font-display text-2xl text-komuna-dark">Kategori belum tersedia.</p>
                <Link href="/communities" className="mt-3 inline-block font-bold text-komuna-forest underline">Buka direktori komunitas</Link>
              </div>
            )}
          </div>
        </section>

        {activeCategory && (
          <>
            <section className="bg-komuna-soft px-4 py-12 sm:py-16">
              <div className="mx-auto max-w-7xl">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">
                  {activeCategories[0] || "Kategori"}
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-4xl">
                  Komunitas pada kategori ini
                </h2>
                {visibleCommunities.length > 0 ? (
                  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleCommunities.map((c) => (
                      <Link key={c.id} href={`/communities/${c.slug}`} className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                        <div className="h-40 overflow-hidden">
                          {c.coverImage || c.logo ? (
                            <img src={c.coverImage || c.logo || ""} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-komuna-forest to-komuna-dark"><span className="font-display text-5xl text-white/25">{c.name.slice(0, 1)}</span></div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="line-clamp-1 text-lg font-bold text-komuna-dark">{c.name}</h3>
                          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-komuna-dark/65">{c.description || "Komunitas untuk bertumbuh bersama."}</p>
                          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-komuna-dark/55">
                            <span>{c.memberCount} anggota</span>
                            <span>{c.eventCount} event</span>
                            <span className="truncate">{c.location || "Indonesia"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-10 text-center">
                    <p className="font-display text-2xl text-komuna-dark">Belum ada komunitas pada kategori ini.</p>
                    <Link href="/communities/create" className="mt-3 inline-block font-bold text-komuna-forest underline">Buat komunitas baru</Link>
                  </div>
                )}
                <Link href="/communities" className="mt-8 inline-flex items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">
                  Lihat semua komunitas <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </section>

            {(events.length > 0 || volunteers.length > 0) && (
              <section className="px-4 py-12 sm:py-16">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
                  {events.length > 0 && (
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Kegiatan</p>
                      <h2 className="mt-3 font-display text-2xl font-semibold text-komuna-dark sm:text-3xl">Event mendatang</h2>
                      <div className="mt-6 space-y-4">
                        {events.slice(0, 3).map((event) => (
                          <Link key={event.id} href={`/events/${event.slug}`} className="group flex items-center gap-4 rounded-2xl border border-komuna-forest/10 bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                              {event.coverImage ? <img src={event.coverImage} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-komuna-coral to-[#c65240] text-white/40 font-display text-2xl">{event.title.slice(0, 1)}</div>}
                            </div>
                            <div className="min-w-0">
                              <h3 className="line-clamp-1 font-bold text-komuna-dark group-hover:text-komuna-forest">{event.title}</h3>
                              <p className="mt-1 text-xs font-bold text-komuna-coral">{formatDate(event.eventDate)}</p>
                              <p className="mt-1 line-clamp-1 text-xs text-komuna-dark/55">{event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi menyusul"}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link href="/events" className="mt-6 inline-flex items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">Lihat semua event <span aria-hidden="true">&rarr;</span></Link>
                    </div>
                  )}
                  {volunteers.length > 0 && (
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Kontribusi</p>
                      <h2 className="mt-3 font-display text-2xl font-semibold text-komuna-dark sm:text-3xl">Kesempatan volunteer</h2>
                      <div className="mt-6 space-y-4">
                        {volunteers.slice(0, 3).map((volunteer) => (
                          <Link key={volunteer.id} href={`/volunteer/${volunteer.slug}`} className="group flex items-center gap-4 rounded-2xl border border-komuna-forest/10 bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-komuna-soft font-display text-2xl text-komuna-coral" aria-hidden="true">+</div>
                            <div className="min-w-0">
                              <h3 className="line-clamp-1 font-bold text-komuna-dark group-hover:text-komuna-forest">{volunteer.title}</h3>
                              <p className="mt-1 text-xs font-bold text-komuna-coral">{volunteer.status === "OPEN" ? "Pendaftaran terbuka" : volunteer.status}</p>
                              <p className="mt-1 line-clamp-1 text-xs text-komuna-dark/55">{volunteer.event?.title || formatDate(volunteer.activityStartDate)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link href="/volunteer" className="mt-6 inline-flex items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">Lihat semua volunteer <span aria-hidden="true">&rarr;</span></Link>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
