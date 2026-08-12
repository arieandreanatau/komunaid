"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardErrorState, DashboardLoadingState, DashboardPageHeader, DashboardSurface } from "@/components/member-dashboard-ui";

type Application = { id: string; status: string; motivation: string | null; createdAt: string; user: { name: string; email: string }; participation: { status: string; attendance: string } | null };
type Program = { status: string };

const statusLabels: Record<string, string> = { PENDING: "Menunggu", ACCEPTED: "Diterima", REJECTED: "Ditolak", CANCELLED_BY_USER: "Dibatalkan peserta", CANCELLED_BY_ORGANIZER: "Dibatalkan penyelenggara", ATTENDED: "Hadir", NO_SHOW: "Tidak hadir" };

export default function VolunteerProgramApplicationsPage() {
  const params = useParams<{ programId: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const applicationsQuery = useQuery<Application[]>({ queryKey: ["volunteer-program", params.programId, "applications"], queryFn: async () => (await api.get(`/volunteer-programs/${params.programId}/applications`)).data.data, enabled: Boolean(params.programId) });
  const programQuery = useQuery<Program>({ queryKey: ["volunteer-program", params.programId], queryFn: async () => (await api.get(`/volunteer-programs/${params.programId}`)).data.data, enabled: Boolean(params.programId) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["volunteer-program", params.programId] });
    queryClient.invalidateQueries({ queryKey: ["volunteer-programs", "my"] });
  };
  const review = useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: "ACCEPT" | "REJECT" | "CANCEL"; note?: string }) => api.patch(`/volunteer-programs/applications/${id}/review`, { action, note }),
    onSuccess: refresh,
    onError: (requestError: any) => setError(requestError.response?.data?.message || "Aksi pendaftar gagal."),
  });
  const attendance = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: "ATTENDED" | "NO_SHOW" }) => api.patch(`/volunteer-programs/applications/${id}/attendance`, { attendance: value }),
    onSuccess: refresh,
    onError: (requestError: any) => setError(requestError.response?.data?.message || "Attendance gagal dicatat."),
  });
  const busy = review.isPending || attendance.isPending;

  return <div className="space-y-7"><DashboardPageHeader title="Pendaftar Volunteer" description="Terima, tolak, batalkan, dan catat attendance. Backend memverifikasi scope, masa akses, status program, dan kuota." />
    <DashboardSurface>{applicationsQuery.isLoading || programQuery.isLoading ? <DashboardLoadingState label="Memuat pendaftar" /> : applicationsQuery.isError || programQuery.isError ? <DashboardErrorState title="Pendaftar tidak dapat diakses" description="Management access mungkin sudah berakhir atau dicabut." onRetry={() => { applicationsQuery.refetch(); programQuery.refetch(); }} /> : <div className="divide-y divide-slate-100">{error && <p role="alert" className="m-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}{applicationsQuery.data?.length ? applicationsQuery.data.map((application) => {
      const canRecordAttendance = application.status === "ACCEPTED" && application.participation?.status === "UPCOMING" && application.participation.attendance === "NOT_RECORDED" && programQuery.data?.status === "ONGOING";
      const attendanceLabel = application.participation?.attendance ? statusLabels[application.participation.attendance] || application.participation.attendance : null;
      return <div key={application.id} className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold text-komuna-navy">{application.user.name}</p><p className="mt-1 text-sm text-slate-500">{application.user.email}</p>{application.motivation && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">{application.motivation}</p>}</div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{statusLabels[application.status] || application.status}</span>{application.participation?.attendance !== "NOT_RECORDED" && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{attendanceLabel}</span>}</div></div><div className="mt-4 flex flex-wrap gap-2">{application.status === "PENDING" && <><button disabled={busy} onClick={() => review.mutate({ id: application.id, action: "ACCEPT" })} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Terima</button><button disabled={busy} onClick={() => review.mutate({ id: application.id, action: "REJECT", note: "Ditolak penyelenggara" })} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Tolak</button></>}{application.status === "ACCEPTED" && <button disabled={busy} onClick={() => { if (window.confirm(`Batalkan partisipasi ${application.user.name}?`)) review.mutate({ id: application.id, action: "CANCEL", note: "Dibatalkan penyelenggara" }); }} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50">Batalkan</button>}{canRecordAttendance && <><button disabled={busy} onClick={() => attendance.mutate({ id: application.id, value: "ATTENDED" })} className="rounded-lg bg-komuna-blue px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Hadir</button><button disabled={busy} onClick={() => attendance.mutate({ id: application.id, value: "NO_SHOW" })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">Tidak Hadir</button></>}</div></div>;
    }) : <div className="p-6 text-sm text-slate-500">Belum ada pendaftar.</div>}</div>}</DashboardSurface></div>;
}
