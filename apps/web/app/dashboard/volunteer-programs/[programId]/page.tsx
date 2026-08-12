"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardErrorState, DashboardLoadingState, DashboardPageHeader, DashboardSurface } from "@/components/member-dashboard-ui";

type Program = {
  id: string; title: string; description: string; location: string; capacity: number; status: string; reviewNote: string | null; reviewedAt: string | null; updatedAt: string;
  startDate: string; endDate: string; applicationCount: number; organizerType: string;
  organizer: { name: string } | null;
  access: { status: string; startsAt: string | null; expiresAt: string | null; revokedAt: string | null; canManage: boolean } | null;
};

const labels: Record<string, string> = { DRAFT: "Draft", UNDER_REVIEW: "Dalam peninjauan", REVISION_REQUIRED: "Perlu revisi", REJECTED: "Ditolak", APPROVED: "Disetujui", SCHEDULED: "Terjadwal", REGISTRATION_OPEN: "Pendaftaran dibuka", REGISTRATION_CLOSED: "Pendaftaran ditutup", ONGOING: "Berlangsung", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };
function date(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export default function VolunteerProgramWorkspacePage() {
  const params = useParams<{ programId: string }>();
  const queryClient = useQueryClient();
  const query = useQuery<Program>({ queryKey: ["volunteer-program", params.programId], queryFn: async () => (await api.get(`/volunteer-programs/${params.programId}`)).data.data, enabled: Boolean(params.programId) });
  const resubmit = useMutation({ mutationFn: async () => api.post(`/volunteer-programs/${params.programId}/resubmit`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["volunteer-program", params.programId] }) });
  const updateProposal = useMutation({ mutationFn: async (payload: Record<string, unknown>) => api.patch(`/volunteer-programs/${params.programId}`, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["volunteer-program", params.programId] }) });
  if (query.isLoading) return <DashboardLoadingState label="Memuat program volunteer" />;
  if (query.isError || !query.data) return <DashboardErrorState title="Program tidak dapat diakses" description="Program mungkin tidak ada atau akses Anda sudah berakhir." onRetry={() => query.refetch()} />;
  const program = query.data;
  const canResubmit = Boolean(program.reviewedAt && new Date(program.updatedAt) > new Date(program.reviewedAt));
  const submitRevision = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateProposal.mutate({ title: form.get("title"), description: form.get("description"), location: form.get("location"), capacity: Number(form.get("capacity")), startDate: new Date(String(form.get("startDate"))).toISOString(), endDate: new Date(String(form.get("endDate"))).toISOString() });
  };
  return <div className="space-y-7"><DashboardPageHeader title={program.title} description={`${program.organizerType === "INDEPENDENT" ? "Program independent" : "Program komunitas"} · ${labels[program.status] || program.status}`} action={program.access?.canManage ? <Link href={`/dashboard/volunteer-programs/${program.id}/applications`} className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white">Kelola Pendaftar</Link> : program.status === "REVISION_REQUIRED" ? <button disabled={resubmit.isPending || !canResubmit} onClick={() => resubmit.mutate()} className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{resubmit.isPending ? "Mengirim..." : "Kirim Ulang Proposal"}</button> : undefined} />
    <DashboardSurface><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"><div className="sm:col-span-2"><p className="text-sm font-bold text-slate-500">Status</p><p className="mt-1 text-lg font-bold text-komuna-navy">{labels[program.status] || program.status}</p></div><div><p className="text-sm font-bold text-slate-500">Jadwal</p><p className="mt-1 text-sm text-slate-700">{date(program.startDate)} sampai {date(program.endDate)}</p></div><div><p className="text-sm font-bold text-slate-500">Kapasitas</p><p className="mt-1 text-sm text-slate-700">{program.applicationCount} pendaftar dari {program.capacity} tempat</p></div><div><p className="text-sm font-bold text-slate-500">Lokasi</p><p className="mt-1 text-sm text-slate-700">{program.location}</p></div><div><p className="text-sm font-bold text-slate-500">Penyelenggara</p><p className="mt-1 text-sm text-slate-700">{program.organizer?.name || "Independent organizer"}</p></div><div className="sm:col-span-2"><p className="text-sm font-bold text-slate-500">Deskripsi</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{program.description}</p></div></div></DashboardSurface>
    {program.status === "REVISION_REQUIRED" && <DashboardSurface><form onSubmit={submitRevision} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><div className="sm:col-span-2"><h2 className="font-bold text-komuna-navy">Revisi Diperlukan</h2><p className="mt-1 text-sm leading-6 text-slate-600">{program.reviewNote || "Perbarui detail proposal, simpan, lalu kirim ulang untuk review Superadmin."}</p></div><label className="sm:col-span-2 text-sm font-bold text-slate-700">Judul<input required name="title" defaultValue={program.title} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="sm:col-span-2 text-sm font-bold text-slate-700">Deskripsi<textarea required minLength={10} name="description" defaultValue={program.description} rows={4} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Lokasi<input required name="location" defaultValue={program.location} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Kuota<input required min="1" type="number" name="capacity" defaultValue={program.capacity} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Mulai<input required type="datetime-local" name="startDate" defaultValue={program.startDate.slice(0, 16)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Selesai<input required type="datetime-local" name="endDate" defaultValue={program.endDate.slice(0, 16)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><button disabled={updateProposal.isPending} className="w-fit rounded-lg border border-komuna-blue px-4 py-2.5 text-sm font-bold text-komuna-blue disabled:opacity-50">{updateProposal.isPending ? "Menyimpan..." : "Simpan Revisi"}</button></form></DashboardSurface>}{program.access && <DashboardSurface><div className="p-5 sm:p-6"><h2 className="font-bold text-komuna-navy">Akses Penyelenggara</h2><p className="mt-2 text-sm leading-6 text-slate-600">{program.access.canManage ? program.access.status === "COMMUNITY_SCOPED" ? "Akses komunitas aktif. Anda dapat mengelola pendaftar dan kehadiran selama program aktif." : `Aktif sampai ${date(program.access.expiresAt!)}. Anda dapat mengelola pendaftar dan kehadiran selama program aktif.` : "Akses operasional tidak aktif. Data program tersedia sebagai riwayat read-only."}</p></div></DashboardSurface>}
  </div>;
}
