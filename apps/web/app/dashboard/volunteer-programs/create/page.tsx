"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { DashboardPageHeader, DashboardLoadingState, DashboardSurface } from "@/components/member-dashboard-ui";

const STEPS = ["Informasi Dasar", "Penyelenggara", "Kesempatan", "Jadwal & Lokasi", "Persyaratan", "Kapasitas & Pendaftaran", "PIC & Media", "Review & Kirim"];

type WizardState = {
  title: string; description: string; location: string; capacity: number;
  organizerType: "COMMUNITY" | "INDEPENDENT"; communityId: string;
  startDate: string; endDate: string; registrationOpensAt: string; registrationDeadline: string;
  requirements: string; benefits: string; responsibilities: string;
  picName: string; picContact: string; coverImage: string; motivation: string;
};

const EMPTY: WizardState = { title: "", description: "", location: "", capacity: 20, organizerType: "COMMUNITY", communityId: "", startDate: "", endDate: "", registrationOpensAt: "", registrationDeadline: "", requirements: "", benefits: "", responsibilities: "", picName: "", picContact: "", coverImage: "", motivation: "" };

export default function CreateVolunteerProgramPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) => setForm((previous) => ({ ...previous, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      if (form.organizerType === "COMMUNITY" && !form.communityId.trim()) {
        throw new Error("Komunitas wajib dipilih.");
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        capacity: Number(form.capacity),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        registrationOpensAt: form.registrationOpensAt ? new Date(form.registrationOpensAt).toISOString() : null,
        registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : null,
      } as Record<string, unknown>;
      if (form.organizerType === "COMMUNITY" && form.communityId) payload.communityId = form.communityId;
      if (form.organizerType === "INDEPENDENT") payload.organizerType = "INDEPENDENT";
      const endpoint = form.organizerType === "COMMUNITY"
        ? `/volunteer-programs/communities/${form.communityId}`
        : "/volunteer-programs/independent-proposals";
      const response = await api.post(endpoint, payload);
      return response.data.data;
    },
    onSuccess: (program) => router.push(`/dashboard/volunteer-programs/${program.id}`),
    onError: (requestError: any) => setError(requestError.response?.data?.message || "Gagal membuat program volunteer."),
  });

  const goNext = () => {
    setError(null);
    if (step === 0 && form.title.trim().length < 3) return setError("Judul minimal 3 karakter.");
    if (step === 0 && form.description.trim().length < 10) return setError("Deskripsi minimal 10 karakter.");
    if (step === 1 && form.organizerType === "COMMUNITY" && !form.communityId.trim()) return setError("ID komunitas wajib diisi.");
    if (step === 2 && form.location.trim().length < 2) return setError("Lokasi minimal 2 karakter.");
    if (step === 3) {
      if (!form.startDate || !form.endDate) return setError("Jadwal mulai dan selesai wajib diisi.");
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return setError("Format jadwal tidak valid.");
      if (start <= new Date()) return setError("Jadwal mulai harus di masa depan.");
      if (end <= start) return setError("Jadwal selesai harus setelah jadwal mulai.");
    }
    if (step === 5) {
      if (!Number.isInteger(form.capacity) || form.capacity < 1) return setError("Kuota minimal 1.");
      if (form.registrationOpensAt && form.registrationDeadline && new Date(form.registrationOpensAt) >= new Date(form.registrationDeadline)) return setError("Tanggal buka harus sebelum batas pendaftaran.");
      if (form.registrationDeadline && new Date(form.registrationDeadline) >= new Date(form.startDate)) return setError("Batas pendaftaran harus sebelum program dimulai.");
    }
    setStep((previous) => Math.min(previous + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((previous) => Math.max(previous - 1, 0));

  if (authLoading) return <DashboardLoadingState label="Memuat halaman" />;
  if (!user) return null;

  const inputClass = "mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue";
  const labelClass = "text-sm font-bold text-slate-700";

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <DashboardPageHeader title="Buat Program Volunteer" description="Lengkapi 8 langkah untuk mengajukan program volunteer baru." />
      <ol className="flex flex-wrap gap-2" aria-label="Langkah pembuatan">
        {STEPS.map((label, index) => (
          <li key={label} className={`rounded-full px-3 py-1 text-xs font-bold ${index === step ? "bg-komuna-blue text-white" : index < step ? "bg-komuna-teal/15 text-komuna-teal" : "bg-slate-100 text-slate-500"}`}>{index + 1}. {label}</li>
        ))}
      </ol>
      <DashboardSurface>
        <div className="space-y-5 p-5 sm:p-6">
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {step === 0 && (<><label className={labelClass}>Judul Program<input className={inputClass} value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Contoh: Bersih Pantai Ancol" /></label><label className={labelClass}>Deskripsi<textarea rows={5} className={inputClass} value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Apa tujuan program dan kegiatan utamanya?" /></label></>)}
          {step === 1 && (<><div className="flex gap-2"><button type="button" onClick={() => set("organizerType", "COMMUNITY")} className={`rounded-lg px-4 py-2 text-sm font-bold ${form.organizerType === "COMMUNITY" ? "bg-komuna-blue text-white" : "border border-slate-200 text-slate-600"}`}>Komunitas</button><button type="button" onClick={() => set("organizerType", "INDEPENDENT")} className={`rounded-lg px-4 py-2 text-sm font-bold ${form.organizerType === "INDEPENDENT" ? "bg-komuna-blue text-white" : "border border-slate-200 text-slate-600"}`}>Independent</button></div><label className={labelClass}>ID Komunitas (untuk tipe Komunitas)<input className={inputClass} value={form.communityId} onChange={(event) => set("communityId", event.target.value)} placeholder="communityId" /></label></>)}
          {step === 2 && (<><label className={labelClass}>Lokasi Kegiatan<input className={inputClass} value={form.location} onChange={(event) => set("location", event.target.value)} placeholder="Kota atau alamat kegiatan" /></label><label className={labelClass}>Motivasi Calon Relawan (opsional)<textarea rows={3} className={inputClass} value={form.motivation} onChange={(event) => set("motivation", event.target.value)} /></label></>)}
          {step === 3 && (<div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Mulai<input type="datetime-local" className={inputClass} value={form.startDate} onChange={(event) => set("startDate", event.target.value)} /></label><label className={labelClass}>Selesai<input type="datetime-local" className={inputClass} value={form.endDate} onChange={(event) => set("endDate", event.target.value)} /></label></div>)}
          {step === 4 && (<><label className={labelClass}>Persyaratan<textarea rows={4} className={inputClass} value={form.requirements} onChange={(event) => set("requirements", event.target.value)} placeholder="Syarat peserta, pengalaman, usia minimal, dll." /></label><label className={labelClass}>Tanggung Jawab<textarea rows={4} className={inputClass} value={form.responsibilities} onChange={(event) => set("responsibilities", event.target.value)} /></label><label className={labelClass}>Manfaat<textarea rows={4} className={inputClass} value={form.benefits} onChange={(event) => set("benefits", event.target.value)} /></label></>)}
           {step === 5 && (<div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Kuota Relawan<input type="number" min={1} className={inputClass} value={form.capacity} onChange={(event) => set("capacity", Number(event.target.value))} /></label><label className={labelClass}>Buka Pendaftaran<input type="datetime-local" className={inputClass} value={form.registrationOpensAt} onChange={(event) => set("registrationOpensAt", event.target.value)} /></label><label className={labelClass}>Batas Pendaftaran<input type="datetime-local" className={inputClass} value={form.registrationDeadline} onChange={(event) => set("registrationDeadline", event.target.value)} /></label></div>)}
          {step === 6 && (<><label className={labelClass}>PIC (Nama)<input className={inputClass} value={form.picName} onChange={(event) => set("picName", event.target.value)} /></label><label className={labelClass}>Kontak PIC<input className={inputClass} value={form.picContact} onChange={(event) => set("picContact", event.target.value)} /></label></>)}
          {step === 7 && (<div className="space-y-3 text-sm"><h2 className="font-bold text-komuna-navy">Ringkasan</h2><dl className="divide-y divide-slate-100"><div className="flex justify-between py-2"><dt className="font-bold text-slate-500">Judul</dt><dd className="text-slate-700">{form.title}</dd></div><div className="flex justify-between py-2"><dt className="font-bold text-slate-500">Jenis</dt><dd className="text-slate-700">{form.organizerType === "COMMUNITY" ? "Komunitas" : "Independent"}</dd></div><div className="flex justify-between py-2"><dt className="font-bold text-slate-500">Lokasi</dt><dd className="text-slate-700">{form.location || "-"}</dd></div><div className="flex justify-between py-2"><dt className="font-bold text-slate-500">Kuota</dt><dd className="text-slate-700">{form.capacity}</dd></div><div className="flex justify-between py-2"><dt className="font-bold text-slate-500">Buka Pendaftaran</dt><dd className="text-slate-700">{form.registrationOpensAt ? new Date(form.registrationOpensAt).toLocaleString("id-ID") : "-"}</dd></div><div className="flex justify-between py-2"><dt className="font-bold text-slate-500">Batas Pendaftaran</dt><dd className="text-slate-700">{form.registrationDeadline ? new Date(form.registrationDeadline).toLocaleString("id-ID") : "-"}</dd></div></dl></div>)}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
          <button type="button" disabled={step === 0} onClick={goBack} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40">Kembali</button>
          {step < STEPS.length - 1
            ? <button type="button" onClick={goNext} className="rounded-lg bg-komuna-blue px-5 py-2 text-sm font-bold text-white">Lanjut</button>
            : <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{save.isPending ? "Mengirim..." : "Kirim Program"}</button>}
        </div>
      </DashboardSurface>
    </div>
  );
}
