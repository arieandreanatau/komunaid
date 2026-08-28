"use client";

import type { InsightData } from "./types";
import { roleBadge } from "./types";

export function InsightTab({ insight, communityName }: { insight: InsightData | null; communityName: string }) {
  if (!insight) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
        Memuat data insight...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Anggota</p>
          <p className="text-3xl font-bold text-komuna-navy">{insight.totalMembers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Permintaan Pending</p>
          <p className="text-3xl font-bold text-komuna-navy">{insight.pendingRequests}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Pertumbuhan Anggota</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-komuna-navy">{insight.memberGrowthRate}%</p>
            <p className="text-sm text-gray-400 pb-1">
              {insight.memberGrowthCount >= 0 ? "+" : ""}{insight.memberGrowthCount} bulan ini
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Distribusi Role Anggota</h3>
        {insight.topMembers.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada data.</p>
        ) : (
          <div className="space-y-3">
            {insight.topMembers.map((item) => {
              const percentage = insight.totalMembers > 0 ? Math.round((item.count / insight.totalMembers) * 100) : 0;
              return (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[item.role] || "bg-gray-100 text-gray-600"}`}>
                        {item.role}
                      </span>
                      <span className="text-sm text-gray-500">{item.count} anggota</span>
                    </div>
                    <span className="text-sm font-medium text-komuna-navy">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-komuna-blue rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Ringkasan {communityName}</h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Total Anggota</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.totalMembers}</p>
          </div>
          <div>
            <p className="text-gray-500">Permintaan Menunggu</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.pendingRequests}</p>
          </div>
          <div>
            <p className="text-gray-500">Tingkat Pertumbuhan</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.memberGrowthRate}%</p>
          </div>
          <div>
            <p className="text-gray-500">Jumlah Role</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.topMembers.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
