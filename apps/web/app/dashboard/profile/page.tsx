"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return res.data.data?.user || res.data.user;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    values: profile ? {
      name: profile.name || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      location: profile.location || "",
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put("/users/profile", data),
    onSuccess: (res) => {
      const updatedUser = res.data.data?.user || res.data.user;
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess("Profile berhasil diupdate!");
      setTimeout(() => setSuccess(""), 3000);
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    setSuccess("");
    mutation.mutate(data);
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-komuna-navy">Profile Saya</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          {profile?.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-komuna-blue flex items-center justify-center text-white text-2xl font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile?.name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input {...register("name", { required: "Nama wajib diisi", minLength: { value: 2, message: "Minimal 2 karakter" } })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{String(errors.name.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input value={profile?.email || ""} disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
            <p className="mt-1 text-xs text-gray-400">Email tidak dapat diubah</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input value={profile?.username || ""} disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
            <p className="mt-1 text-xs text-gray-400">Username tidak dapat diubah</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telepon</label>
            <input {...register("phone")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
              placeholder="Nomor telepon" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lokasi</label>
            <input {...register("location")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
              placeholder="Kota, Provinsi" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea {...register("bio")} rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue resize-none"
              placeholder="Ceritakan tentang diri Anda..." />
            <p className="mt-1 text-xs text-gray-400">Maksimal 500 karakter</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}