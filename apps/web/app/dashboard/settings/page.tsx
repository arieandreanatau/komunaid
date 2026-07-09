"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "@/lib/api";

export default function SettingsPage() {
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
      api.put("/auth/change-password", data),
    onSuccess: () => {
      setSuccess("Password berhasil diubah!");
      reset();
      setTimeout(() => setSuccess(""), 3000);
    },
  });

  const onSubmit = (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) => {
    setSuccess("");
    if (data.newPassword !== data.confirmNewPassword) {
      return;
    }
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-komuna-navy">Pengaturan</h1>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubah Password</h2>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4">{success}</div>
        )}

        {changePasswordMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
            {(changePasswordMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal mengubah password"}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
            <input type="password" {...register("currentPassword", { required: "Wajib diisi" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" />
            {errors.currentPassword && <p className="mt-1 text-sm text-red-500">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input type="password" {...register("newPassword", { required: "Wajib diisi", minLength: { value: 8, message: "Minimal 8 karakter" } })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" />
            {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
            <input type="password" {...register("confirmNewPassword", { required: "Wajib diisi" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="px-6 py-2.5 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">
            {isSubmitting ? "Mengubah..." : "Ubah Password"}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Status Akun</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Aktif</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900">Terkonfirmasi</span>
          </div>
        </div>
      </div>
    </div>
  );
}