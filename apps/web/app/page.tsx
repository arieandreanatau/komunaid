import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";

const organizationEnabled = process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED === "true";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.API_URL || "http://localhost:3001";
}

async function fetchPublic<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/${endpoint}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return (data.data || data.communities || data.events || data.organizations || fallback) as T;
  } catch {
    return fallback;
  }
}

const features = [
  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", title: "Komunitas Terstruktur", desc: "Buat dan kelola komunitas dengan sistem keanggotaan, role, dan moderasi yang terstruktur.", bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue" },
  { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", title: "Event Management", desc: "Jadwalkan dan kelola event dengan kuota, registrasi online, check-in, dan analytics.", bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal" },
  { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", title: "Volunteer Matching", desc: "Temukan peluang volunteer dan berkontribusi untuk komunitas di seluruh Indonesia.", bgClass: "bg-komuna-aqua/10", textClass: "text-komuna-aqua" },
  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Keamanan & Moderasi", desc: "Sistem approval, RBAC, dan moderasi konten untuk keamanan platform.", bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal" },
  { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Dashboard Analytics", desc: "Pantau pertumbuhan komunitas, statistik event, dan insight anggota secara real-time.", bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue" },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Kolaborasi Terstruktur", desc: "Platform yang memudahkan kolaborasi antar komunitas dan individu.", bgClass: "bg-komuna-aqua/10", textClass: "text-komuna-aqua" },
];

const partners = [
  { name: "Komunitas Tech Indonesia", logo: null },
  { name: "Indonesian Developer Community", logo: null },
  { name: "Relawan Nusantara", logo: null },
  { name: "Gerakan Digital Indonesia", logo: null },
  { name: "Forum Komunitas Digital", logo: null },
  { name: "Indonesia Volunteer Network", logo: null },
  { name: "Yayasan Literasi Indonesia", logo: null },
  { name: "Komunitas Peduli Lingkungan", logo: null },
];

const stats = [
  { value: "100+", label: "Komunitas" },
  { value: "500+", label: "Anggota" },
  { value: "50+", label: "Event" },
  { value: "25+", label: "Kota" },
];

export default async function HomePage() {
  const [communityData, eventData, volData] = await Promise.all([
    fetchPublic<any[]>("communities?limit=6&sort=desc&orderBy=memberCount", []),
    fetchPublic<any[]>("events?limit=6&upcoming=true", []),
    fetchPublic<any[]>("volunteer?limit=6", []),
  ]);

  const orgData = organizationEnabled
    ? await fetchPublic<any[]>("organizations?limit=6", [])
    : [];

  const communities = Array.isArray(communityData) ? communityData : [];
  const events = Array.isArray(eventData) ? eventData : [];
  const organizations = Array.isArray(orgData) ? orgData : [];
  const volunteers = Array.isArray(volData) ? volData : [];

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-komuna-aqua focus:text-komuna-navy focus:px-4 focus:py-2 focus:rounded-lg">
        Langkah ke konten utama
      </a>
      <JsonLd type="website" />
      <JsonLd type="organization" />

      <Header />

      <main id="main-content" className="flex-1">
        <section className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-20 left-10 w-32 h-32" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="white" /></svg>
          <svg className="absolute bottom-20 right-20 w-48 h-48" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="white" /></svg>
          <svg className="absolute top-40 right-40 w-20 h-20" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="white" /></svg>
        </div>
        <div className="container mx-auto px-4 py-24 md:py-32 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Platform Komunitas<br />Digital Indonesia
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-komuna-aqua/90 max-w-2xl mx-auto font-medium">
            Terhubung. Berdaya. Berdampak.
          </p>
          <p className="text-lg mb-10 text-white/80 max-w-xl mx-auto">
            Temukan komunitas, ikuti event, bergabung sebagai relawan, dan bangun koneksi yang bermakna dalam satu platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3.5 text-base font-semibold bg-komuna-aqua text-komuna-navy rounded-lg hover:bg-white transition-colors">
              Mulai Sekarang
            </Link>
            <Link href="/communities" className="px-8 py-3.5 text-base font-semibold border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors">
              Jelajahi Komunitas
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-komuna-navy mb-3">Mengapa KomunaID?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Solusi lengkap untuk mengelola komunitas, event, dan volunteer dalam satu platform terintegrasi.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
                <div key={f.title} className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className={`h-12 w-12 ${f.bgClass} rounded-lg flex items-center justify-center mb-4`}>
                    <svg className={`h-6 w-6 ${f.textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-komuna-navy mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {communities.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-komuna-navy">Komunitas Populer</h2>
              <Link href="/communities" className="text-komuna-blue text-sm font-medium hover:underline">Lihat Semua &rarr;</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.slice(0, 6).map((c: any) => (
                <Link key={c.id} href={`/communities/${c.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="h-40 relative overflow-hidden">
                    {c.headerImage || c.logo ? (
                      <img src={c.headerImage || c.logo} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-komuna-blue to-komuna-navy flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-20">{c.name?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-komuna-navy text-sm mb-1 line-clamp-1 group-hover:text-komuna-blue transition-colors">{c.name}</h3>
                    {c.location && <p className="text-xs text-gray-500 mb-1">{c.location}</p>}
                    {c.description && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{c.description}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{c.memberCount || 0} anggota</span>
                      <span>{c.eventCount || 0} event</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {organizationEnabled && organizations.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-komuna-navy">Organisasi Terdaftar</h2>
              <Link href="/organizations" className="text-komuna-blue text-sm font-medium hover:underline">Lihat Semua &rarr;</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.slice(0, 6).map((o: any) => (
                <Link key={o.id} href={`/organizations/${o.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="h-40 relative overflow-hidden">
                    {o.banner ? (
                      <img src={o.banner} alt={o.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-komuna-teal to-komuna-blue flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-20">{o.name?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-komuna-navy text-sm mb-1 line-clamp-1 group-hover:text-komuna-blue transition-colors">{o.name}</h3>
                    {o.description && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{o.description}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{o.memberCount || 0} anggota</span>
                      {o.industry && <span className="px-2 py-0.5 bg-komuna-teal/10 text-komuna-teal rounded-full">{o.industry}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-komuna-navy">Event Mendatang</h2>
              <Link href="/events" className="text-komuna-blue text-sm font-medium hover:underline">Lihat Semua &rarr;</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 6).map((e: any) => (
                <Link key={e.id} href={`/events/${e.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="h-40 relative overflow-hidden">
                    {e.coverImage || e.thumbnail ? (
                      <img src={e.coverImage || e.thumbnail} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-20">{e.title?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-komuna-navy text-sm mb-1 line-clamp-1 group-hover:text-komuna-blue transition-colors">{e.title}</h3>
                    <p className="text-xs text-gray-500 mb-1">{e.eventDate ? new Date(e.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}</p>
                    {e.description && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{e.description}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{e.locationType === "ONLINE" ? "Online" : e.location || "TBD"}</span>
                      <span>{e.registeredCount || 0}{e.quota ? `/${e.quota}` : ""} peserta</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {volunteers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-komuna-navy">Volunteer Mendatang</h2>
              <Link href="/volunteer" className="text-komuna-blue text-sm font-medium hover:underline">Lihat Semua &rarr;</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteers.slice(0, 6).map((v: any) => (
                <Link key={v.id} href={`/volunteer/${v.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="h-40 relative overflow-hidden">
                    {v.coverImage || v.thumbnail ? (
                      <img src={v.coverImage || v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-komuna-teal to-komuna-aqua flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-20">{v.title?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-komuna-navy text-sm mb-1 line-clamp-1 group-hover:text-komuna-blue transition-colors">{v.title}</h3>
                    <p className="text-xs text-gray-500 mb-1">{v.eventDate ? new Date(v.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : (v.startDate || "")}</p>
                    {v.description && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{v.description}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{v.location || v.locationType || "TBD"}</span>
                      <span>{v.registeredCount || 0}/{v.quota || "∞"} peserta</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-komuna-navy mb-3">Statistik Kami</h2>
            <p className="text-gray-500">Pertumbuhan komunitas digital Indonesia</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-komuna-blue">{s.value}</div>
                <div className="text-sm text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-komuna-teal/10 to-komuna-aqua/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-komuna-navy mb-4">Jadi Relawan, Berikan Dampak</h2>
              <p className="text-gray-600 mb-6">Temukan peluang volunteer dari komunitas di seluruh Indonesia. Daftar, ikut, dan buktikan kontribusimu.</p>
              <ul className="space-y-3 mb-8">
                {["Cari peluang volunteer berdasarkan lokasi, kategori, atau minat", "Langsung daftar secara online tanpa proses ribet", "Pantau status dan histori kegiatan volunteer Anda"].map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-komuna-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/volunteer" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-komuna-teal rounded-lg hover:bg-komuna-blue transition-colors">
                Lihat Peluang Volunteer
              </Link>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 space-y-4">
              {volunteers.slice(0, 3).map((v: any) => (
                <Link key={v.id} href={`/volunteer/${v.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 bg-komuna-teal/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-komuna-navy truncate">{v.title}</div>
                    <div className="text-xs text-gray-500">{v.event?.title || ""}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{v.status || "Open"}</span>
                </Link>
              ))}
              {volunteers.length === 0 && (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 bg-komuna-teal/10 rounded-lg flex items-center justify-center shrink-0"><svg className="h-5 w-5 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>
                    <div className="flex-1"><div className="font-semibold text-sm text-komuna-navy">Bersih-bersih Pantai</div><div className="text-xs text-gray-500">Jakarta Selatan</div></div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Open</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 bg-komuna-blue/10 rounded-lg flex items-center justify-center shrink-0"><svg className="h-5 w-5 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                    <div className="flex-1"><div className="font-semibold text-sm text-komuna-navy">Guru Mengajar</div><div className="text-xs text-gray-500">Bandung</div></div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Open</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-komuna-blue/10 to-komuna-navy/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-komuna-navy mb-4">Jadi Komunitas, Bangun Gerakan</h2>
              <p className="text-gray-600 mb-6">Buat komunitasmu sendiri, kelola anggota, jalankan event, dan bangun dampak bersama di seluruh Indonesia.</p>
              <ul className="space-y-3 mb-8">
                {["Buat komunitas dan undang anggota untuk bergabung", "Kelola event, volunteer, dan diskusi dalam satu tempat", "Dapatkan dashboard analytics untuk pertumbuhan komunitasmu"].map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-komuna-blue mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors">
                Daftar Gratis
              </Link>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                {communities.slice(0, 3).map((c: any) => (
                  <Link key={c.id} href={`/communities/${c.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 bg-komuna-blue/10 rounded-lg flex items-center justify-center shrink-0">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <svg className="h-5 w-5 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-komuna-navy truncate">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.memberCount || 0} anggota</div>
                    </div>
                  </Link>
                ))}
                {communities.length === 0 && (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="h-10 w-10 bg-komuna-blue/10 rounded-lg flex items-center justify-center shrink-0"><svg className="h-5 w-5 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                      <div className="flex-1"><div className="font-semibold text-sm text-komuna-navy">Tech Jakarta</div><div className="text-xs text-gray-500">120 anggota</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="h-10 w-10 bg-komuna-teal/10 rounded-lg flex items-center justify-center shrink-0"><svg className="h-5 w-5 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                      <div className="flex-1"><div className="font-semibold text-sm text-komuna-navy">Design Bandung</div><div className="text-xs text-gray-500">85 anggota</div></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {organizationEnabled && (
      <section className="py-12 bg-white border-y overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-xl font-bold text-komuna-navy mb-8">Organisasi / Mitra Kami</h2>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex overflow-hidden">
              <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
                {[...partners, ...partners].map((p, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0 px-4 py-2">
                    {p.logo ? (
                      <img src={p.logo} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-komuna-blue/10 flex items-center justify-center">
                        <span className="text-komuna-blue font-bold text-xs">{p.name[0]}</span>
                      </div>
                    )}
                    <span className="text-gray-400 font-semibold text-sm md:text-base">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      </main>

      <Footer />
    </div>
  );
}
