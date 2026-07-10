"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";

interface CommunitySettings {
  showMemberList: boolean;
  showEventList: boolean;
  allowMemberPost: boolean;
  requireApproval: boolean;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner: string | null;
  logo: string | null;
  location: string | null;
  website: string | null;
  membershipType: string;
  visibility: string;
  status: string;
  owner: { id: string; name: string };
  tags: { id: string; tag: string }[];
  settings: CommunitySettings;
  userMembership: { role: string } | null;
}

const TAG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

export default function CommunitySettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [banner, setBanner] = useState("");
  const [logo, setLogo] = useState("");
  const [membershipType, setMembershipType] = useState("OPEN");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [allowMemberPost, setAllowMemberPost] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [showMemberList, setShowMemberList] = useState(true);
  const [showEventList, setShowEventList] = useState(true);
  const [tags, setTags] = useState<{ id: string; tag: string }[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [saveGeneral, setSaveGeneral] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);
  const [saveLogo, setSaveLogo] = useState(false);
  const [savePrivacy, setSavePrivacy] = useState(false);
  const [saveSettings, setSaveSettings] = useState(false);
  const [saveTags, setSaveTags] = useState(false);

  const [archiveModal, setArchiveModal] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/communities/${slug}/settings`)}`);
      return;
    }
    fetchCommunity();
  }, [slug, isAuthenticated]);

  useEffect(() => {
    if (community) {
      setName(community.name);
      setDescription(community.description || "");
      setLocation(community.location || "");
      setWebsite(community.website || "");
      setBanner(community.banner || "");
      setLogo(community.logo || "");
      setMembershipType(community.membershipType);
      setVisibility(community.visibility);
      setAllowMemberPost(community.settings.allowMemberPost ?? true);
      setRequireApproval(community.settings.requireApproval ?? false);
      setShowMemberList(community.settings.showMemberList ?? true);
      setShowEventList(community.settings.showEventList ?? true);
      setTags(community.tags || []);
    }
  }, [community]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/communities/${slug}`);
      setCommunity(data.community);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data komunitas.");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && community && user.id === community.owner.id;
  const isAdmin = user && community && (isOwner || community.userMembership?.role === "ADMIN");

  useEffect(() => {
    if (!loading && community && !isAdmin) {
      router.replace(`/communities/${slug}`);
    }
  }, [loading, community, isAdmin]);

  const handleSaveGeneral = async () => {
    if (!community) return;
    setSaveGeneral(true);
    try {
      await api.put(`/communities/${community.id}`, { name, description, location, website });
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaveGeneral(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!community) return;
    setSaveBanner(true);
    try {
      await api.put(`/communities/${community.id}/banner`, { banner });
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan banner.");
    } finally {
      setSaveBanner(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!community) return;
    setSaveLogo(true);
    try {
      await api.put(`/communities/${community.id}/logo`, { logo });
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan logo.");
    } finally {
      setSaveLogo(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!community) return;
    setSavePrivacy(true);
    try {
      await api.put(`/communities/${community.id}`, { membershipType, visibility });
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan pengaturan privasi.");
    } finally {
      setSavePrivacy(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!community) return;
    setSaveSettings(true);
    try {
      await api.put(`/communities/${community.id}/settings`, {
        allowMemberPost,
        requireApproval,
        showMemberList,
        showEventList,
      });
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaveSettings(false);
    }
  };

  const handleSaveTags = async () => {
    if (!community) return;
    setSaveTags(true);
    try {
      await api.put(`/communities/${community.id}`, { tags: tags.map((t) => t.tag) });
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan tag.");
    } finally {
      setSaveTags(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.length >= 10) {
      alert("Maksimal 10 tag.");
      return;
    }
    if (tags.some((t) => t.tag.toLowerCase() === trimmed.toLowerCase())) {
      alert("Tag sudah ada.");
      return;
    }
    setTags([...tags, { id: `temp-${Date.now()}`, tag: trimmed }]);
    setTagInput("");
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const handleArchive = async () => {
    if (!community || archiveConfirm !== community.name) return;
    setArchiveLoading(true);
    try {
      await api.put(`/communities/${community.id}`, { status: "ARCHIVED" });
      router.push("/communities");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengarsipkan komunitas.");
    } finally {
      setArchiveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Memuat pengaturan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!community && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-komuna-navy mb-2">Komunitas Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-4">Komunitas yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.</p>
            <Link href="/communities" className="text-komuna-blue hover:underline">Kembali ke Direktori</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin === false && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-komuna-navy mb-2">Akses Ditolak</h2>
            <p className="text-gray-500 mb-4">Anda tidak memiliki akses ke pengaturan komunitas ini.</p>
            <Link href={`/communities/${slug}`} className="text-komuna-blue hover:underline">Kembali ke Komunitas</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/communities" className="hover:text-komuna-blue transition-colors">
              Komunitas
            </Link>
            <span>/</span>
            <Link href={`/communities/${slug}`} className="hover:text-komuna-blue transition-colors">
              {community.name}
            </Link>
            <span>/</span>
            <span className="text-komuna-navy font-medium">Pengaturan</span>
          </nav>

          <h1 className="text-2xl font-bold text-komuna-navy mb-8">Pengaturan Komunitas</h1>

          <div className="space-y-8">
            {/* Pengaturan Umum */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Pengaturan Umum</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Komunitas</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={3}
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{name.length}/100</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{description.length}/2000</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveGeneral}
                    disabled={saveGeneral || name.trim().length < 3}
                    className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {saveGeneral && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Simpan
                  </button>
                </div>
              </div>
            </section>

            {/* Media */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Media</h2>
              <div className="space-y-6">
                {/* Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner URL</label>
                  <input
                    type="url"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                  />
                  {banner && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                      <img src={banner} alt="Banner preview" className="w-full h-40 object-cover" />
                    </div>
                  )}
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSaveBanner}
                      disabled={saveBanner}
                      className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {saveBanner && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      Simpan Banner
                    </button>
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                  <input
                    type="url"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                  />
                  {logo && (
                    <div className="mt-3">
                      <img src={logo} alt="Logo preview" className="h-20 w-20 rounded-xl object-cover border border-gray-200" />
                    </div>
                  )}
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSaveLogo}
                      disabled={saveLogo}
                      className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {saveLogo && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      Simpan Logo
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Privasi & Keanggotaan */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Privasi &amp; Keanggotaan</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tipe Keanggotaan</p>
                    <p className="text-xs text-gray-500">Terbuka: siapa saja bisa bergabung. Terbatas: perlu persetujuan.</p>
                  </div>
                  <button
                    onClick={() => setMembershipType(membershipType === "OPEN" ? "RESTRICTED" : "OPEN")}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                      membershipType === "OPEN" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        membershipType === "OPEN" ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-right">{membershipType === "OPEN" ? "Terbuka" : "Terbatas"}</p>

                <div className="border-t border-gray-100" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Visibilitas</p>
                    <p className="text-xs text-gray-500">Publik: terlihat semua. Privat: hanya anggota.</p>
                  </div>
                  <button
                    onClick={() => setVisibility(visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC")}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                      visibility === "PUBLIC" ? "bg-komuna-blue" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        visibility === "PUBLIC" ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-right">{visibility === "PUBLIC" ? "Publik" : "Privat"}</p>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={savePrivacy}
                    className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {savePrivacy && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Simpan
                  </button>
                </div>
              </div>
            </section>

            {/* Pengaturan Komunitas */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Pengaturan Komunitas</h2>
              <div className="space-y-4">
                {[
                  { label: "Izinkan Anggota Posting", desc: "Anggota dapat membuat postingan", value: allowMemberPost, onChange: setAllowMemberPost },
                  { label: "Persetujuan Wajib", desc: "Semua postingan harus disetujui admin", value: requireApproval, onChange: setRequireApproval },
                  { label: "Tampilkan Daftar Anggota", desc: "Daftar anggota terlihat di halaman publik", value: showMemberList, onChange: setShowMemberList },
                  { label: "Tampilkan Daftar Event", desc: "Event terlihat di halaman komunitas", value: showEventList, onChange: setShowEventList },
                ].map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div className="border-t border-gray-100 mb-4" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                          item.value ? "bg-komuna-blue" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.value ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveSettings}
                    className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {saveSettings && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Simpan
                  </button>
                </div>
              </div>
            </section>

            {/* Tag */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Tag</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((t, i) => (
                  <span
                    key={t.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                  >
                    #{t.tag}
                    <button
                      onClick={() => handleRemoveTag(t.id)}
                      className="ml-0.5 hover:opacity-70 transition-opacity"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {tags.length === 0 && <p className="text-sm text-gray-400">Belum ada tag.</p>}
              </div>
              <p className="text-xs text-gray-400 mb-3">{tags.length}/10 tag</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder="Tambah tag baru..."
                  maxLength={50}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                />
                <button
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Tambah
                </button>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveTags}
                  disabled={saveTags}
                  className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saveTags && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Simpan Tag
                </button>
              </div>
            </section>

            {/* Zona Bahaya */}
            <section className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Zona Bahaya</h2>
              <p className="text-sm text-gray-500 mb-4">
                Mengarsipkan komunitas akan menyembunyikannya dari publik. Anggota masih bisa mengakses.
              </p>
              <button
                onClick={() => setArchiveModal(true)}
                className="px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors"
              >
                Arsipkan Komunitas
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Archive Modal */}
      {archiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setArchiveModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={() => setArchiveModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-red-600 mb-1">Arsipkan Komunitas</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ketik <strong className="text-komuna-navy">{community.name}</strong> untuk mengonfirmasi.
            </p>
            <input
              type="text"
              value={archiveConfirm}
              onChange={(e) => setArchiveConfirm(e.target.value)}
              placeholder="Nama komunitas..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setArchiveModal(false);
                  setArchiveConfirm("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleArchive}
                disabled={archiveConfirm !== community.name || archiveLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {archiveLoading && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Arsipkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
