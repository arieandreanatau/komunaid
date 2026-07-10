"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface CommunityMember {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  coverImage: string | null;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  website: string | null;
  instagram: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  membershipType: string;
  visibility: string;
  status: string;
  owner: { id: string; name: string; avatar: string | null };
  memberCount: number;
  eventCount: number;
  membersPreview: CommunityMember[];
  upcomingEvents: CommunityEvent[];
  categories: { id: string; name: string }[];
  tags: { id: string; tag: string }[];
  settings: { showMemberList: boolean; showEventList: boolean };
  userMembership: { role: string; status: string } | null;
  pendingJoinRequests: number;
}

const TAG_COLORS = [
  "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700",
];

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => { fetchCommunity(); }, [slug]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/communities/${slug}`);
      setCommunity(data.community);
      fetchRelated(data.community?.id);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data komunitas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (id?: string) => {
    try {
      const { data } = await api.get("/communities", { params: { limit: 3, status: "APPROVED", visibility: "PUBLIC" } });
      const items = (data.communities || data.data || []).filter((c: any) => c.id !== id);
      setRelated(items.slice(0, 3));
    } catch {}
  };

  const handleJoin = async () => {
    if (!community) return;
    setJoinLoading(true);
    try {
      await api.post(`/communities/${community.id}/join`, { message: joinMessage || undefined });
      setJoinModalOpen(false);
      setJoinMessage("");
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengirim permintaan.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!community) return;
    if (!confirm("Yakin ingin keluar dari komunitas ini?")) return;
    setActionLoading(true);
    try { await api.post(`/communities/${community.id}/leave`); fetchCommunity(); }
    catch (err: any) { alert(err?.response?.data?.message || "Gagal keluar dari komunitas."); }
    finally { setActionLoading(false); }
  };

  const isOwner = user && community && user.id === community.owner.id;
  const isAdmin = user && community && (isOwner || community.userMembership?.role === "ADMIN");
  const isMember = !!community?.userMembership;
  const isPending = community?.userMembership?.status === "PENDING";

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center"><div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-500">Memuat komunitas...</p></div>
      </div>
    </div>
  );

  if (error || !community) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
          <h2 className="text-2xl font-bold text-komuna-navy mb-2">Komunitas Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">{error || "Komunitas yang kamu cari tidak tersedia."}</p>
          <Link href="/communities" className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors">Kembali ke Direktori</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  const renderActions = () => {
    if (!isAuthenticated) return (
      <Link href={`/login?redirect=${encodeURIComponent(`/communities/${slug}`)}`} className="inline-flex items-center gap-2 px-6 py-3 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
        Masuk untuk Bergabung
      </Link>
    );
    if (isAdmin) return (
      <div className="flex flex-wrap gap-3">
        <Link href={`/communities/${slug}/edit`} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Edit</Link>
        <Link href={`/dashboard/communities/${community!.id}`} className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm">
          Dashboard {community!.pendingJoinRequests > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{community!.pendingJoinRequests}</span>}
        </Link>
      </div>
    );
    if (isMember) return (
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm border border-emerald-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Anggota <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs capitalize">{community!.userMembership!.role}</span>
        </span>
        {!isOwner && <button onClick={handleLeave} disabled={actionLoading} className="px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm disabled:opacity-50">Keluar</button>}
      </div>
    );
    if (isPending) return <span className="px-5 py-2.5 bg-amber-50 text-amber-700 rounded-lg font-medium text-sm border border-amber-200">Menunggu Persetujuan</span>;
    if (community!.membershipType === "RESTRICTED") return (
      <button onClick={() => setJoinModalOpen(true)} className="px-6 py-3 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors">Minta Bergabung</button>
    );
    return <button onClick={handleJoin} disabled={actionLoading} className="px-6 py-3 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors disabled:opacity-50">Bergabung</button>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {community.banner ? (
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <img src={community.banner} alt={`${community.name} banner`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : (
          <div className="relative h-64 md:h-80 w-full bg-gradient-to-br from-komuna-blue via-komuna-teal to-komuna-blue overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-white/20 text-[200px] font-bold leading-none select-none">{community.name[0]}</span></div>
          </div>
        )}

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto -mt-16 relative z-10">
            <Breadcrumbs items={[{ label: "Komunitas", href: "/communities" }, { label: community.name }]} />
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div className="flex-shrink-0">
                {community.logo ? (
                  <img src={community.logo} alt={`${community.name} logo`} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white" />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg bg-komuna-blue flex items-center justify-center"><span className="text-white text-3xl md:text-4xl font-bold">{community.name[0]}</span></div>
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-komuna-navy truncate">{community.name}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${community.visibility === "PUBLIC" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>{community.visibility === "PUBLIC" ? "Publik" : "Privat"}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${community.membershipType === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{community.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}</span>
                </div>
                {community.location && <p className="flex items-center gap-1 text-sm text-gray-500"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{community.location}</p>}
              </div>
              <div className="flex-shrink-0">{renderActions()}</div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            <div className="lg:col-span-2 space-y-6">
              {community.description && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-3">Tentang Komunitas</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{community.description}</p>
                </div>
              )}
              {community.categories.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-3">Kategori</h2>
                  <div className="flex flex-wrap gap-2">{community.categories.map((cat) => <span key={cat.id} className="px-3 py-1.5 bg-komuna-blue/10 text-komuna-blue rounded-full text-sm font-medium">{cat.name}</span>)}</div>
                </div>
              )}
              {community.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-3">Tag</h2>
                  <div className="flex flex-wrap gap-2">{community.tags.map((t, i) => <span key={t.id} className={`px-3 py-1 rounded-full text-sm font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>#{t.tag}</span>)}</div>
                </div>
              )}
              {community.settings.showEventList && community.upcomingEvents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-4">Event Mendatang</h2>
                  <div className="space-y-3">
                    {community.upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/events/${event.slug}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-komuna-navy group-hover:text-komuna-blue transition-colors truncate">{event.title}</p>
                          <p className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                        </div>
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-komuna-blue transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-komuna-navy">{community.memberCount}</p><p className="text-sm text-gray-500">Anggota</p></div>
                  <div><p className="text-2xl font-bold text-komuna-navy">{community.eventCount}</p><p className="text-sm text-gray-500">Event</p></div>
                  <div><p className="text-2xl font-bold text-komuna-navy">{community.categories.length}</p><p className="text-sm text-gray-500">Kategori</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Pemilik</h3>
                <div className="flex items-center gap-3">
                  {community.owner.avatar ? <img src={community.owner.avatar} alt={community.owner.name} className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-komuna-blue flex items-center justify-center"><span className="text-white font-bold text-sm">{community.owner.name[0]}</span></div>}
                  <div className="min-w-0"><p className="font-medium text-komuna-navy truncate">{community.owner.name}</p><p className="text-xs text-gray-500">Pemilik Komunitas</p></div>
                </div>
              </div>
              {(community.website || community.instagram || community.contactEmail || community.contactPhone) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Kontak & Media Sosial</h3>
                  <div className="space-y-3">
                    {community.website && <a href={community.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-komuna-blue hover:underline"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>{community.website.replace(/^https?:\/\//, "").slice(0, 40)}</a>}
                    {community.instagram && <p className="flex items-center gap-2 text-sm text-gray-600"><svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>{community.instagram}</p>}
                    {community.contactEmail && <a href={`mailto:${community.contactEmail}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-komuna-blue transition-colors"><svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{community.contactEmail}</a>}
                    {community.contactPhone && <p className="flex items-center gap-2 text-sm text-gray-600"><svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{community.contactPhone}</p>}
                  </div>
                </div>
              )}
              {community.settings.showMemberList && community.membersPreview.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Anggota</h3>
                    <span className="text-xs text-gray-400">{community.memberCount} total</span>
                  </div>
                  <div className="space-y-3">
                    {community.membersPreview.slice(0, 10).map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        {member.avatar ? <img src={member.avatar} alt={member.name} className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center shrink-0"><span className="text-komuna-blue font-bold text-xs">{member.name[0]}</span></div>}
                        <div className="min-w-0 flex-1"><p className="text-sm font-medium text-komuna-navy truncate">{member.name}</p>{member.role !== "MEMBER" && <p className="text-xs text-gray-500 capitalize">{member.role.toLowerCase()}</p>}</div>
                      </div>
                    ))}
                  </div>
                  {community.memberCount > 10 && <p className="mt-3 text-xs text-gray-400 text-center">+{community.memberCount - 10} anggota lainnya</p>}
                </div>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <div className="max-w-4xl mx-auto pb-12">
              <h2 className="text-xl font-semibold text-komuna-navy mb-4">Komunitas Terkait</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.id} href={`/communities/${r.slug}`} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      {r.logo ? <img src={r.logo} alt={r.name} className="h-8 w-8 rounded-lg object-cover" /> : <div className="h-8 w-8 rounded-lg bg-komuna-blue/10 flex items-center justify-center"><span className="text-komuna-blue font-bold text-xs">{r.name?.[0]}</span></div>}
                      <span className="font-medium text-komuna-navy text-sm truncate">{r.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{r.memberCount || 0} anggota</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setJoinModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setJoinModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-1">Minta Bergabung</h3>
            <p className="text-sm text-gray-500 mb-4">Kirim permintaan bergabung ke <strong>{community.name}</strong>.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pesan (opsional)</label>
            <textarea value={joinMessage} onChange={(e) => setJoinMessage(e.target.value)} rows={4} placeholder="Ceritakan mengapa kamu ingin bergabung..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setJoinModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
              <button onClick={handleJoin} disabled={joinLoading} className="flex-1 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm disabled:opacity-50">{joinLoading ? "Mengirim..." : "Kirim Permintaan"}</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
