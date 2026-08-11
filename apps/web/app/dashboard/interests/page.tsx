"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageHeader,
  DashboardSurface,
} from "@/components/member-dashboard-ui";
import { useToast } from "@/components/ui/toast";

// Suggestions remain UI helpers; persisted interests always come from profile API.
const SUGGESTED_INTERESTS = [
  "Teknologi", "Desain", "Bisnis", "Pendidikan", "Sosial",
  "Kesehatan", "Seni", "Musik", "Olahraga", "Perjalanan",
  "Kuliner", "Fotografi", "Gaming", "Keuangan", "Startup",
];

export default function InterestsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [newInterest, setNewInterest] = useState("");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data.data?.user || response.data.user;
    },
  });

  const interests: string[] = profileQuery.data?.interests || [];
  const mutation = useMutation({
    mutationFn: (updatedInterests: string[]) => api.put("/users/interests", { interests: updatedInterests }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      addToast("Minat berhasil diperbarui.", "success");
    },
    onError: () => addToast("Minat gagal diperbarui. Silakan coba lagi.", "error"),
  });

  const addInterest = (value: string) => {
    const interest = value.trim();
    const alreadySelected = interests.some((item) => item.toLocaleLowerCase("id-ID") === interest.toLocaleLowerCase("id-ID"));
    if (!interest || alreadySelected || interests.length >= 20 || mutation.isPending) return;
    mutation.mutate([...interests, interest]);
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    if (mutation.isPending) return;
    mutation.mutate(interests.filter((item) => item !== interest));
  };

  return (
    <div className="space-y-6 pb-8">
      <DashboardPageHeader
        title="Minat & Ketertarikan"
        description="Kelola topik yang Anda sukai untuk membantu KomunaID menampilkan pengalaman yang lebih relevan."
      />

      <DashboardSurface>
        {profileQuery.isLoading ? (
          <DashboardLoadingState label="Memuat minat" />
        ) : profileQuery.isError ? (
          <DashboardErrorState title="Minat tidak dapat dimuat" onRetry={() => profileQuery.refetch()} />
        ) : (
          <div className="divide-y divide-slate-100">
            <section className="p-5 sm:p-6" aria-labelledby="selected-interests-title">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 id="selected-interests-title" className="font-bold text-komuna-navy">Minat Saya</h2>
                  <p className="mt-1 text-sm text-slate-500">Maksimal 20 minat. Saat ini {interests.length} dipilih.</p>
                </div>
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-komuna-blue">
                  {interests.length}/20
                </span>
              </div>

              {interests.length === 0 ? (
                <DashboardEmptyState
                  title="Belum ada minat"
                  description="Pilih saran di bawah atau tambahkan minat sendiri untuk mulai membangun preferensi Anda."
                  icon={
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.958c.3.921-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.197-1.539-1.118l1.286-3.958a1 1 0 00-.364-1.118L4.06 9.385c-.783-.57-.38-1.81.588-1.81H8.81a1 1 0 00.951-.69l1.288-3.958z" />
                    </svg>
                  }
                />
              ) : (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Minat yang dipilih">
                  {interests.map((interest) => (
                    <li key={interest} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 py-1.5 pl-3 pr-1.5 text-sm font-semibold text-komuna-blue">
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        disabled={mutation.isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue disabled:cursor-wait disabled:opacity-50"
                        aria-label={`Hapus minat ${interest}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form
                className="mt-6 flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  addInterest(newInterest);
                }}
              >
                <div className="flex-1">
                  <label htmlFor="custom-interest" className="sr-only">Tambah minat sendiri</label>
                  <input
                    id="custom-interest"
                    value={newInterest}
                    onChange={(event) => setNewInterest(event.target.value)}
                    disabled={mutation.isPending || interests.length >= 20}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-komuna-blue focus:ring-2 focus:ring-komuna-blue/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="Contoh: Lingkungan"
                    maxLength={50}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newInterest.trim() || interests.length >= 20 || mutation.isPending}
                  className="rounded-lg bg-komuna-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-komuna-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {mutation.isPending ? "Menyimpan..." : "Tambah Minat"}
                </button>
              </form>
            </section>

            <section className="p-5 sm:p-6" aria-labelledby="suggested-interests-title">
              <h2 id="suggested-interests-title" className="font-bold text-komuna-navy">Saran Minat</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Pilihan ini hanya membantu pengisian. Anda tetap dapat menambahkan minat sendiri.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.filter(
                  (suggestion) => !interests.some((item) => item.toLocaleLowerCase("id-ID") === suggestion.toLocaleLowerCase("id-ID"))
                ).map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => addInterest(interest)}
                    disabled={mutation.isPending || interests.length >= 20}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-komuna-blue/40 hover:bg-blue-50 hover:text-komuna-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + {interest}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </DashboardSurface>
    </div>
  );
}
