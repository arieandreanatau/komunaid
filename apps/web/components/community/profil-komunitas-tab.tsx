"use client";

import Link from "next/link";
import type { DashboardData } from "./types";

export function ProfilKomunitasTab({ community }: { community: DashboardData["community"] }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-komuna-blue text-2xl font-bold text-white shadow-sm">
                {community.name.charAt(0).toUpperCase()}
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-komuna-navy">{community.name}</h2>
                <p className="mt-1 text-sm text-slate-500">/{community.slug}</p>
              </div>
            </div>
            <Link href="/dashboard/communities" className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Kelola komunitas
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-komuna-navy">Tentang Komunitas</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{community.description || "Belum ada deskripsi komunitas."}</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-komuna-navy">Informasi</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd className="font-semibold text-emerald-700">{community.status}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Visibility</dt><dd className="font-semibold text-slate-700">{community.visibility}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Membership</dt><dd className="font-semibold text-slate-700">{community.membershipType}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Dibuat</dt><dd className="font-semibold text-slate-700">{new Date(community.createdAt).toLocaleDateString("id-ID")}</dd></div>
          </dl>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Anggota", community.memberCount], ["Event", community.eventCount], ["Permintaan", "-"], ["Volunteer", "-"]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-komuna-navy">{value}</p></div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-5">
        <div><p className="font-bold text-komuna-navy">Perlu mengubah informasi?</p><p className="mt-1 text-sm text-slate-600">Edit profil komunitas melalui Pengaturan.</p></div>
        <Link href={`/dashboard/communities/${community.slug}/settings`} className="rounded-lg bg-komuna-blue px-4 py-2 text-sm font-bold text-white hover:bg-komuna-navy">Edit Profil</Link>
      </div>
    </div>
  );
}
