"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState, DashboardPageHeader, DashboardSurface } from "@/components/member-dashboard-ui";

type Program = { id: string; title: string; status: string; startDate: string; endDate: string; _count: { applications: number } };
const labels: Record<string, string> = { DRAFT: "Draft", SUBMITTED: "Menunggu review", UNDER_REVIEW: "Menunggu review", REVISION_REQUIRED: "Perlu revisi", REJECTED: "Ditolak", APPROVED: "Disetujui", SCHEDULED: "Terjadwal", REGISTRATION_OPEN: "Pendaftaran dibuka", REGISTRATION_CLOSED: "Pendaftaran ditutup", ONGOING: "Berlangsung", COMPLETED: "Selesai", CANCELLED: "Dibatalkan", ARCHIVED: "History" };
type Filter = "all" | "period" | "single" | "history" | "revision" | "rejected" | "cancelled";

export default function CommunityVolunteerWorkspacePage() {
  const { communityId } = useParams<{ communityId: string }>();
  const [filter, setFilter] = useState<Filter>("all");
  const query = useQuery<Program[]>({ queryKey: ["community-volunteer-programs", communityId], queryFn: async () => (await api.get(`/volunteer-programs/communities/${communityId}`)).data.data, enabled: Boolean(communityId) });
  const createAction = !query.isError ? <Link href={`/dashboard/communities/${communityId}/volunteer/create`} className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white">Buat Program</Link> : undefined;
  const filtered = useMemo(() => (query.data || []).filter((program) => {
    if (filter === "history") return ["COMPLETED", "ARCHIVED"].includes(program.status);
    if (filter === "revision") return program.status === "REVISION_REQUIRED";
    if (filter === "rejected") return program.status === "REJECTED";
    if (filter === "cancelled") return program.status === "CANCELLED";
    return true;
  }), [query.data, filter]);
  return <div className="space-y-7"><DashboardPageHeader title="Volunteer Komunitas" description="Kelola Volunteer Periode dan Volunteer Satu Kali dalam community-scoped workspace." action={createAction} /><div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px" role="tablist" aria-label="Filter lifecycle volunteer">{[["all", "Semua"], ["period", "Volunteer Periode"], ["single", "Volunteer Satu Kali"], ["history", "History"], ["revision", "Perlu revisi"], ["rejected", "Ditolak"], ["cancelled", "Dibatalkan"]].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value as Filter)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${filter === value ? "border-komuna-blue text-komuna-blue" : "border-transparent text-slate-500"}`}>{label}</button>)}</div><DashboardSurface>{query.isLoading ? <DashboardLoadingState label="Memuat program volunteer komunitas" /> : query.isError ? <DashboardErrorState title="Program volunteer tidak dapat diakses" description="Role Anda mungkin tidak memiliki volunteer.view." onRetry={() => query.refetch()} /> : filtered.length ? <div className="divide-y divide-slate-100">{filtered.map((program) => <Link key={program.id} href={`/dashboard/volunteer-programs/${program.id}`} className="block px-5 py-4 hover:bg-slate-50 sm:px-6"><div className="flex items-center justify-between gap-4"><div><p className="font-bold text-komuna-navy">{program.title}</p><p className="mt-1 text-sm text-slate-500">{program._count.applications} pendaftar</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{labels[program.status] || program.status}</span></div></Link>)}</div> : <DashboardEmptyState title="Belum ada program volunteer" description="Buat program volunteer untuk komunitas ini." action={createAction} />}</DashboardSurface></div>;
}
