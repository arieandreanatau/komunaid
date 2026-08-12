"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { DashboardPageHeader, DashboardSurface } from "@/components/member-dashboard-ui";

export default function ProposeVolunteerProgramPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError(null);
    const form = new FormData(event.currentTarget);
    const startDate = new Date(String(form.get("startDate"))).toISOString();
    const endDate = new Date(String(form.get("endDate"))).toISOString();
    const deadlineValue = String(form.get("registrationDeadline") || "");
    try {
      await api.post("/volunteer-programs/independent-proposals", {
        title: form.get("title"), description: form.get("description"), location: form.get("location"), capacity: Number(form.get("capacity")),
        startDate, endDate, ...(deadlineValue ? { registrationDeadline: new Date(deadlineValue).toISOString() } : {}),
      });
      router.push("/dashboard/volunteers");
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || "Proposal tidak dapat dikirim.");
    } finally { setSubmitting(false); }
  }

  return <div className="space-y-7"><DashboardPageHeader title="Ajukan Program Volunteer" description="Proposal independent ditinjau Superadmin. Program belum tampil publik dan akses kelola belum aktif sebelum disetujui." />
    <DashboardSurface><form onSubmit={submit} className="space-y-5 p-5 sm:p-6"><div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-bold text-slate-700">Judul<input required name="title" maxLength={200} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-komuna-blue" /></label><label className="sm:col-span-2 text-sm font-bold text-slate-700">Deskripsi<textarea required name="description" minLength={10} maxLength={5000} rows={5} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-komuna-blue" /></label><label className="text-sm font-bold text-slate-700">Lokasi<input required name="location" maxLength={200} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-komuna-blue" /></label><label className="text-sm font-bold text-slate-700">Kuota<input required name="capacity" type="number" min="1" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-komuna-blue" /></label><label className="text-sm font-bold text-slate-700">Mulai<input required name="startDate" type="datetime-local" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-komuna-blue" /></label><label className="text-sm font-bold text-slate-700">Selesai<input required name="endDate" type="datetime-local" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-komuna-blue" /></label><label className="text-sm font-bold text-slate-700">Batas pendaftaran<input name="registrationDeadline" type="datetime-local" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-komuna-blue" /></label></div>{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button disabled={submitting} className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{submitting ? "Mengirim..." : "Kirim Proposal"}</button></form></DashboardSurface></div>;
}
