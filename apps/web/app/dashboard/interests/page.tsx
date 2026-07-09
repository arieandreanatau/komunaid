"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

const SUGGESTED_INTERESTS = [
  "Technology", "Design", "Business", "Education", "Social",
  "Health", "Art", "Music", "Sports", "Travel",
  "Food", "Photography", "Gaming", "Finance", "Startup",
];

export default function InterestsPage() {
  const queryClient = useQueryClient();
  const [newInterest, setNewInterest] = useState("");
  const [success, setSuccess] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return res.data.data?.user || res.data.user;
    },
  });

  const interests: string[] = profile?.interests || [];

  const mutation = useMutation({
    mutationFn: (updatedInterests: string[]) => api.put("/users/interests", { interests: updatedInterests }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess("Interests berhasil diupdate!");
      setTimeout(() => setSuccess(""), 3000);
    },
  });

  const addInterest = (interest: string) => {
    if (interest && !interests.includes(interest) && interests.length < 20) {
      mutation.mutate([...interests, interest]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    mutation.mutate(interests.filter((i: string) => i !== interest));
  };

  const handleAddCustom = () => {
    if (newInterest.trim()) {
      addInterest(newInterest.trim());
    }
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-komuna-navy">Minat & Ketertarikan</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">{success}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-600 mb-4">Pilih minat Anda untuk mendapatkan rekomendasi komunitas dan event yang sesuai.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {interests.map((interest: string) => (
            <span key={interest} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-komuna-blue/10 text-komuna-blue text-sm font-medium rounded-full">
              {interest}
              <button onClick={() => removeInterest(interest)} className="hover:text-red-500 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
          {interests.length === 0 && (
            <p className="text-sm text-gray-400">Belum ada minat yang dipilih</p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
            placeholder="Tambah minat custom..."
            maxLength={50}
          />
          <button onClick={handleAddCustom} disabled={!newInterest.trim() || interests.length >= 20}
            className="px-4 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">
            Tambah
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Minat yang Disarankan</h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_INTERESTS.filter(i => !interests.includes(i)).map((interest) => (
              <button key={interest} onClick={() => addInterest(interest)}
                className="px-3 py-1.5 border border-gray-200 text-sm text-gray-600 rounded-full hover:bg-komuna-blue/5 hover:text-komuna-blue hover:border-komuna-blue/30 transition-colors">
                + {interest}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}