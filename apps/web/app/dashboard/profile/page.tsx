"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type ProfileForm = { name: string; phone: string; bio: string; location: string };

const inputClass = "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-komuna-blue focus:ring-2 focus:ring-komuna-blue/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500";

function ProfileSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby={`${title}-title`}>
      <div className="mb-5">
        <h2 id={`${title}-title`} className="text-base font-bold text-komuna-navy">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-slate-700">{label}</label>{children}{error ? <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p> : null}</div>;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data.data?.user || response.data.user;
    },
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileForm>({ defaultValues: { name: "", phone: "", bio: "", location: "" } });
  const bio = watch("bio") || "";

  useEffect(() => {
    if (profile) reset({ name: profile.name || "", phone: profile.phone || "", bio: profile.bio || "", location: profile.location || "" });
  }, [profile, reset]);

  useEffect(() => {
    if (!isDirty) return;
    const preventUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [isDirty]);

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => api.put("/users/profile", data),
    onSuccess: (res) => {
      const updated = res.data.data?.user || res.data.user;
      setUser({ ...user!, ...updated });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      reset({ name: updated.name || "", phone: updated.phone || "", bio: updated.bio || "", location: updated.location || "" });
      showNotice("success", "Profil berhasil diperbarui.");
    },
    onError: () => showNotice("error", "Profil gagal diperbarui. Silakan coba lagi."),
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData(); formData.append("file", file);
      return api.post("/users/profile/photo", formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: (res) => { const avatar = res.data.data?.avatar; if (avatar) setUser({ ...user!, avatar }); queryClient.invalidateQueries({ queryKey: ["profile"] }); showNotice("success", "Foto profil berhasil diperbarui."); },
    onError: () => showNotice("error", "Foto profil gagal diunggah."),
  });

  const emailMutation = useMutation({
    mutationFn: (value: string) => api.put("/users/change-email", { email: value }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["profile"] }); setShowEmailForm(false); showNotice("success", "Email berhasil diubah."); },
    onError: (err: any) => showNotice("error", err?.response?.data?.message || "Email gagal diubah."),
  });
  const usernameMutation = useMutation({
    mutationFn: (value: string) => api.put("/users/change-username", { username: value }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["profile"] }); setShowUsernameForm(false); showNotice("success", "Username berhasil diubah."); },
    onError: (err: any) => showNotice("error", err?.response?.data?.message || "Username gagal diubah."),
  });
  const passwordMutation = useMutation({
    mutationFn: (data: typeof passwordForm) => api.put("/auth/change-password", data),
    onSuccess: () => { setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" }); setShowPasswordForm(false); showNotice("success", "Password berhasil diubah. Silakan login kembali."); },
    onError: (err: any) => showNotice("error", err?.response?.data?.message || "Password gagal diubah."),
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) showNotice("error", "Format foto harus JPG, PNG, atau WebP.");
    else if (file.size > 5 * 1024 * 1024) showNotice("error", "Ukuran foto maksimal 5MB.");
    else photoMutation.mutate(file);
    event.target.value = "";
  };

  if (isLoading) return <div className="mx-auto max-w-3xl space-y-5" aria-label="Memuat profil">{[1, 2, 3, 4].map((item) => <div key={item} className="h-40 animate-pulse rounded-xl bg-slate-200" />)}</div>;

  const initial = profile?.name?.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight text-komuna-navy">Profil Saya</h1><p className="mt-1.5 text-sm leading-6 text-slate-600">Kelola informasi pribadi dan preferensi akun Anda.</p></div>
      {notice && <div role="status" className={`fixed right-4 top-20 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${notice.type === "success" ? "border-teal-200 bg-teal-50 text-teal-800" : "border-red-200 bg-red-50 text-red-700"}`}>{notice.message}</div>}

      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="group relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
              {profile?.avatar ? <img src={profile.avatar} alt={`Foto profil ${profile.name}`} className="h-full w-full rounded-full object-cover" /> : <div className="flex h-full w-full items-center justify-center rounded-full bg-komuna-blue text-3xl font-bold text-white">{initial}</div>}
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={photoMutation.isPending} className="absolute inset-0 flex rounded-full bg-komuna-navy/65 p-2 text-center text-xs font-semibold text-white opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 disabled:opacity-100" aria-label="Ubah foto profil"><span className="m-auto">{photoMutation.isPending ? "Mengunggah..." : "Ubah Foto"}</span></button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="sr-only" />
            </div>
            <div className="min-w-0 flex-1"><p className="text-xl font-bold text-komuna-navy">{profile?.name || "Belum tersedia"}</p><p className="mt-1 text-sm text-slate-500">@{profile?.username || "belum-tersedia"}</p><p className="mt-2 text-sm font-medium text-komuna-teal">Member KomunaID</p><button type="button" onClick={() => fileInputRef.current?.click()} disabled={photoMutation.isPending} className="mt-3 text-sm font-semibold text-komuna-blue hover:text-komuna-navy disabled:opacity-50">{photoMutation.isPending ? "Mengunggah..." : profile?.avatar ? "Ganti Foto" : "Ubah Foto"}</button><p className="mt-1 text-xs text-slate-500">JPG, PNG, atau WebP. Maksimal 5MB.</p></div>
          </div>
        </section>

        <form onSubmit={handleSubmit((data) => profileMutation.mutate(data))} className="space-y-5">
          <ProfileSection title="Informasi Dasar" description="Kelola informasi yang ditampilkan pada profil Anda.">
            <div className="space-y-5"><Field label="Nama Lengkap" error={errors.name?.message}><input {...register("name", { required: "Nama lengkap wajib diisi.", minLength: { value: 2, message: "Nama lengkap minimal 2 karakter." } })} className={inputClass} autoComplete="name" /></Field><Field label="Username" hint="Username digunakan untuk identitas akun Anda."><div className="mt-1.5 flex gap-2"><input value={profile?.username || ""} readOnly className={`${inputClass} mt-0`} /><button type="button" onClick={() => { setUsername(profile?.username || ""); setShowUsernameForm(!showUsernameForm); }} className="rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-komuna-blue/20">Ubah</button></div></Field>{showUsernameForm && <div className="rounded-lg bg-slate-50 p-4"><Field label="Username Baru"><input value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} autoComplete="username" /></Field><div className="mt-3 flex gap-2"><button type="button" onClick={() => usernameMutation.mutate(username)} disabled={usernameMutation.isPending} className="rounded-lg bg-komuna-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{usernameMutation.isPending ? "Menyimpan..." : "Simpan Username"}</button><button type="button" onClick={() => setShowUsernameForm(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Batal</button></div></div>}<Field label="Bio" hint={`${bio.length} / 500`}><textarea {...register("bio", { maxLength: { value: 500, message: "Bio maksimal 500 karakter." } })} rows={5} maxLength={500} className={`${inputClass} resize-y`} placeholder="Ceritakan tentang diri Anda..." /></Field></div>
          </ProfileSection>
          <ProfileSection title="Informasi Kontak">
            <div className="space-y-5"><Field label="Email" hint="Email digunakan untuk autentikasi dan notifikasi akun."><input value={profile?.email || ""} readOnly className={inputClass} aria-readonly="true" /></Field><button type="button" onClick={() => { setEmail(profile?.email || ""); setShowEmailForm(!showEmailForm); }} className="text-sm font-semibold text-komuna-blue hover:text-komuna-navy">Ubah email</button>{showEmailForm && <div className="rounded-lg bg-slate-50 p-4"><Field label="Email Baru"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} autoComplete="email" /></Field><div className="mt-3 flex gap-2"><button type="button" onClick={() => emailMutation.mutate(email)} disabled={emailMutation.isPending} className="rounded-lg bg-komuna-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{emailMutation.isPending ? "Menyimpan..." : "Simpan Email"}</button><button type="button" onClick={() => setShowEmailForm(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Batal</button></div></div>}<Field label="Telepon"><input {...register("phone")} type="tel" className={inputClass} placeholder="08xxxxxxxxxx" autoComplete="tel" /></Field></div>
          </ProfileSection>
          <ProfileSection title="Lokasi"><Field label="Lokasi"><div className="relative mt-1.5"><svg className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><input {...register("location")} className={`${inputClass} mt-0 pl-10`} placeholder="Masukkan lokasi Anda" autoComplete="address-level2" /></div></Field></ProfileSection>
          <ProfileSection title="Keamanan Akun" description="Kelola keamanan akun dan password Anda."><div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-slate-800">Password</h3><p className="mt-1 text-sm text-slate-500">Password terakhir diperbarui: Belum tersedia</p></div><button type="button" onClick={() => setShowPasswordForm(!showPasswordForm)} className="rounded-lg border border-komuna-blue px-4 py-2.5 text-sm font-semibold text-komuna-blue hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-komuna-blue/20">{showPasswordForm ? "Tutup" : "Ubah Password"}</button></div>{showPasswordForm && <div className="mt-5 space-y-4 border-t border-slate-100 pt-5"><Field label="Password Saat Ini"><input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} className={inputClass} autoComplete="current-password" /></Field><Field label="Password Baru" hint="Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka."><input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} className={inputClass} autoComplete="new-password" /></Field><Field label="Konfirmasi Password Baru"><input type="password" value={passwordForm.confirmNewPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmNewPassword: event.target.value })} className={inputClass} autoComplete="new-password" /></Field><button type="button" onClick={() => { if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) return showNotice("error", "Semua field password wajib diisi."); if (passwordForm.newPassword !== passwordForm.confirmNewPassword) return showNotice("error", "Password baru tidak cocok."); passwordMutation.mutate(passwordForm); }} disabled={passwordMutation.isPending} className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-komuna-navy disabled:opacity-50">{passwordMutation.isPending ? "Menyimpan..." : "Simpan Password"}</button></div>}</ProfileSection>
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur"><div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">{isDirty ? "Perubahan belum disimpan." : "Tidak ada perubahan baru."}</p><div className="flex gap-2"><button type="button" onClick={() => reset()} disabled={!isDirty || isSubmitting} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Batalkan</button><button type="submit" disabled={!isDirty || isSubmitting} className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-komuna-navy disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</button></div></div></div>
        </form>
      </div>
    </div>
  );
}
