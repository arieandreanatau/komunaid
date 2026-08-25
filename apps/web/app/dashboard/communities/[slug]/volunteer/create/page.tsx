"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { DashboardPageHeader, DashboardSurface } from "@/components/member-dashboard-ui";

export default function CreateCommunityVolunteerProgramPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [resolvedCommunityId, setResolvedCommunityId] = useState("");
  useEffect(() => {
    if (!slug) return;
    api.get(`/communities/${slug}`).then(({ data }) => setResolvedCommunityId((data.data || data).id)).catch(() => {});
  }, [slug]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(null);
    const form = new FormData(event.currentTarget);
    try { await api.post(`/volunteer-programs/communities/${resolvedCommunityId}`, { communityId: resolvedCommunityId, title: form.get("title"), description: form.get("description"), location: form.get("location"), capacity: Number(form.get("capacity")), startDate: new Date(String(form.get("startDate"))).toISOString(), endDate: new Date(String(form.get("endDate"))).toISOString() }); router.push(`/dashboard/communities/${slug}/volunteer`); } catch (requestError: any) { setError(requestError.response?.data?.message || "Program volunteer gagal dibuat."); } finally { setSubmitting(false); }
  }
  return <div className="space-y-7"><DashboardPageHeader title="Buat Program Volunteer" description="Program dibuat dalam konteks komunitas ini. Penerbitan mengikuti lifecycle program." /><DashboardSurface><form onSubmit={submit} className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"><label className="sm:col-span-2 text-sm font-bold text-slate-700">Judul<input required name="title" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="sm:col-span-2 text-sm font-bold text-slate-700">Deskripsi<textarea required minLength={10} name="description" rows={5} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Lokasi<input required name="location" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Kuota<input required min="1" type="number" name="capacity" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Mulai<input required type="datetime-local" name="startDate" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Selesai<input required type="datetime-local" name="endDate" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>{error && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button disabled={submitting} className="w-fit rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{submitting ? "Membuat..." : "Buat Program"}</button></form></DashboardSurface></div>;
}
