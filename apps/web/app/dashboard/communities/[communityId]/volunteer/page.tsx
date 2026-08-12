"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState, DashboardPageHeader, DashboardSurface } from "@/components/member-dashboard-ui";

type Program = { id: string; title: string; status: string; startDate: string; endDate: string; _count: { applications: number } };
const labels: Record<string, string> = { DRAFT: "Draft", SCHEDULED: "Terjadwal", REGISTRATION_OPEN: "Pendaftaran dibuka", REGISTRATION_CLOSED: "Pendaftaran ditutup", ONGOING: "Berlangsung", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };

export default function CommunityVolunteerWorkspacePage() {
  const { communityId } = useParams<{ communityId: string }>();
  const query = useQuery<Program[]>({ queryKey: ["community-volunteer-programs", communityId], queryFn: async () => (await api.get(`/volunteer-programs/communities/${communityId}`)).data.data, enabled: Boolean(communityId) });
  const createAction = !query.isError ? <Link href={`/dashboard/communities/${communityId}/volunteer/create`} className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white">Buat Program</Link> : undefined;
  return <div className="space-y-7"><DashboardPageHeader title="Volunteer Komunitas" description="Program volunteer pada komunitas ini. Akses berdasarkan role community-scoped Anda." action={createAction} /><DashboardSurface>{query.isLoading ? <DashboardLoadingState label="Memuat program volunteer komunitas" /> : query.isError ? <DashboardErrorState title="Program volunteer tidak dapat diakses" description="Role Anda mungkin tidak memiliki volunteer.view." onRetry={() => query.refetch()} /> : query.data?.length ? <div className="divide-y divide-slate-100">{query.data.map((program) => <Link key={program.id} href={`/dashboard/volunteer-programs/${program.id}`} className="block px-5 py-4 hover:bg-slate-50 sm:px-6"><div className="flex items-center justify-between gap-4"><div><p className="font-bold text-komuna-navy">{program.title}</p><p className="mt-1 text-sm text-slate-500">{program._count.applications} pendaftar</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{labels[program.status] || program.status}</span></div></Link>)}</div> : <DashboardEmptyState title="Belum ada program volunteer" description="Buat program volunteer untuk komunitas ini." action={createAction} />}</DashboardSurface></div>;
}
