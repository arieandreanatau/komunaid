"use client";

import type { JoinRequest } from "./types";

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export function PermintaanTab({
  requests,
  requestStatusFilter,
  setRequestStatusFilter,
  requestPage,
  setRequestPage,
  requestTotalPages,
  onApprove,
  onReject,
}: {
  requests: JoinRequest[];
  requestStatusFilter: string;
  setRequestStatusFilter: (v: string) => void;
  requestPage: number;
  setRequestPage: (v: number) => void;
  requestTotalPages: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex overflow-x-auto gap-1 border-b border-gray-200 pb-px">
        {[
          { value: "", label: "Semua" },
          { value: "PENDING", label: "Menunggu" },
          { value: "APPROVED", label: "Disetujui" },
          { value: "REJECTED", label: "Ditolak" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setRequestStatusFilter(filter.value); setRequestPage(1); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              requestStatusFilter === filter.value
                ? "border-komuna-blue text-komuna-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Tidak ada permintaan.
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start gap-4">
                {req.avatar ? (
                  <img src={req.avatar} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-komuna-blue flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{req.name?.[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-komuna-navy">{req.name}</p>
                    <span className="text-xs text-gray-400">@{req.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[req.status] || ""}`}>
                      {statusLabel[req.status] || req.status}
                    </span>
                  </div>
                  {req.message && (
                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg p-3">{req.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(req.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                {req.status === "PENDING" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onApprove(req.id)}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Setuju
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {requestTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setRequestPage(Math.max(1, requestPage - 1))}
            disabled={requestPage <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">
            {requestPage} / {requestTotalPages}
          </span>
          <button
            onClick={() => setRequestPage(Math.min(requestTotalPages, requestPage + 1))}
            disabled={requestPage >= requestTotalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
