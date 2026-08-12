"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageHeader,
  DashboardSurface,
} from "@/components/member-dashboard-ui";

type Application = {
  id: string;
  status: string;
  createdAt: string;
  volunteerProgram: { id: string; title: string; status: string; startDate: string; organizerType: string };
  participation: { status: string; attendance: string } | null;
};

type Program = {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  accesses: { status: string; startsAt: string; expiresAt: string; revokedAt: string | null }[];
  _count: { applications: number };
};

type VolunteerData = { applications: Application[]; organizedPrograms: Program[] };

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu konfirmasi",
  ACCEPTED: "Terdaftar",
  REJECTED: "Ditolak",
  CANCELLED_BY_USER: "Dibatalkan oleh saya",
  CANCELLED_BY_ORGANIZER: "Dibatalkan penyelenggara",
  UPCOMING: "Akan datang",
  COMPLETED: "Selesai",
  ATTENDED: "Hadir",
  NO_SHOW: "Tidak hadir",
  UNDER_REVIEW: "Dalam peninjauan",
  REVISION_REQUIRED: "Perlu revisi",
  APPROVED: "Disetujui",
  SCHEDULED: "Terjadwal",
  REGISTRATION_OPEN: "Pendaftaran dibuka",
  REGISTRATION_CLOSED: "Pendaftaran ditutup",
  ONGOING: "Berlangsung",
  CANCELLED: "Dibatalkan",
};

const statusTone: Record<string, string> = {
  ACCEPTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ATTENDED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED_BY_USER: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED_BY_ORGANIZER: "bg-red-50 text-red-700 ring-red-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
  REGISTRATION_OPEN: "bg-blue-50 text-blue-700 ring-blue-200",
};

function Badge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusTone[status] || "bg-slate-50 text-slate-600 ring-slate-200"}`}>{statusLabel[status] || status}</span>;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function MyVolunteersPage() {
  const query = useQuery<VolunteerData>({
    queryKey: ["volunteer-programs", "my"],
    queryFn: async () => (await api.get("/volunteer-programs/my")).data.data,
  });

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title="Volunteer Saya"
        description="Pendaftaran dan riwayat volunteer pribadi. Kelola program hanya dari akses penyelenggara yang aktif."
        action={<Link href="/dashboard/volunteers/propose" className="inline-flex rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-komuna-navy">Ajukan Program Volunteer</Link>}
      />

      <DashboardSurface>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="font-bold text-komuna-navy">Partisipasi Saya</h2></div>
        {query.isLoading ? <DashboardLoadingState label="Memuat volunteer saya" /> : query.isError ? <DashboardErrorState onRetry={() => query.refetch()} /> : query.data?.applications.length ? (
          <div className="divide-y divide-slate-100">
            {query.data.applications.map((application) => (
              <Link key={application.id} href={`/dashboard/volunteer-programs/${application.volunteerProgram.id}`} className="block px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-bold text-komuna-navy">{application.volunteerProgram.title}</p><p className="mt-1 text-sm text-slate-500">Mulai {dateLabel(application.volunteerProgram.startDate)}</p></div>
                  <div className="flex flex-wrap gap-2"><Badge status={application.status} />{application.participation && <Badge status={application.participation.attendance} />}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : <DashboardEmptyState title="Belum ada volunteer" description="Temukan kegiatan yang sesuai dan kirim pendaftaran volunteer." action={<Link href="/volunteer" className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white">Jelajahi Volunteer</Link>} />}
      </DashboardSurface>

      <DashboardSurface>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="font-bold text-komuna-navy">Program Volunteer Saya</h2><p className="mt-1 text-sm text-slate-500">Proposal dan program independent. Akses pengelolaan berhenti saat selesai atau dibatalkan.</p></div>
        {query.isLoading ? <DashboardLoadingState label="Memuat program volunteer" /> : query.isError ? <DashboardErrorState onRetry={() => query.refetch()} /> : query.data?.organizedPrograms.length ? (
          <div className="divide-y divide-slate-100">
            {query.data.organizedPrograms.map((program) => {
              const access = program.accesses[0];
              const active = access?.status === "ACTIVE" && new Date(access.startsAt) <= new Date() && new Date(access.expiresAt) > new Date() && !["COMPLETED", "CANCELLED"].includes(program.status);
              return <Link key={program.id} href={`/dashboard/volunteer-programs/${program.id}`} className="block px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-komuna-navy">{program.title}</p><p className="mt-1 text-sm text-slate-500">{program._count.applications} pendaftar · Berakhir {dateLabel(program.endDate)}</p></div><div className="flex flex-wrap gap-2"><Badge status={program.status} />{access && <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${active ? "bg-komuna-teal/10 text-komuna-teal ring-komuna-teal/20" : "bg-slate-50 text-slate-600 ring-slate-200"}`}>{active ? "Akses kelola aktif" : "Riwayat saja"}</span>}</div></div></Link>;
            })}
          </div>
        ) : <DashboardEmptyState title="Belum ada program diajukan" description="Setiap pengguna terautentikasi dapat mengajukan program volunteer independent untuk ditinjau Superadmin." action={<Link href="/dashboard/volunteers/propose" className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white">Ajukan Program</Link>} />}
      </DashboardSurface>
    </div>
  );
}
