"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setSuccess("");
      setError(err?.response?.data?.message || "Gagal update profile");
      setTimeout(() => setError(""), 3000);
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/users/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      const avatar = res.data.data?.avatar;
      if (avatar) {
        setUser({ ...user!, avatar });
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess("Foto profile berhasil diupdate!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setSuccess("");
      setError(err?.response?.data?.message || "Gagal upload foto");
      setTimeout(() => setError(""), 3000);
    },
  });

  const emailMutation = useMutation({
    mutationFn: (email: string) => api.put("/users/change-email", { email }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess("Email berhasil diubah!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setSuccess("");
      setError(err?.response?.data?.message || "Gagal mengubah email");
      setTimeout(() => setError(""), 3000);
    },
  });

  const usernameMutation = useMutation({
    mutationFn: (username: string) => api.put("/users/change-username", { username }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess("Username berhasil diubah!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setSuccess("");
      setError(err?.response?.data?.message || "Gagal mengubah username");
      setTimeout(() => setError(""), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
      api.put("/auth/change-password", data),
    onSuccess: () => {
      setSuccess("Password berhasil diubah! Silakan login kembali.");
      setError("");
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (err: any) => {
      setSuccess("");
      setError(err?.response?.data?.message || "Gagal mengubah password");
      setTimeout(() => setError(""), 3000);
    },
  });

  const interestsMutation = useMutation({
    mutationFn: (interests: string[]) => api.put("/users/interests", { interests }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess("Interests berhasil diupdate!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setSuccess("");
      setError(err?.response?.data?.message || "Gagal update interests");
      setTimeout(() => setError(""), 3000);
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    setSuccess("");
    setError("");
    mutation.mutate(data);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    photoMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [editingInterests, setEditingInterests] = useState(false);
  const [interestsText, setInterestsText] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-komuna-navy">Profile Saya</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-komuna-blue flex items-center justify-center text-white text-2xl font-bold">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoMutation.isPending}
              className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <span className="text-white text-xs font-medium">
                {photoMutation.isPending ? "Upload..." : "Ubah Foto"}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile?.name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4">{success}</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
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
            <div className="mt-1 flex gap-2">
              <input
                value={editingEmail ? newEmail : profile?.email || ""}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={!editingEmail}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue ${editingEmail ? "border-gray-300" : "border-gray-200 bg-gray-50 text-gray-500"}`}
              />
              {editingEmail ? (
                <>
                  <button type="button" onClick={() => { emailMutation.mutate(newEmail); setEditingEmail(false); }}
                    className="px-3 py-2 bg-komuna-blue text-white text-sm rounded-lg hover:bg-komuna-navy">Simpan</button>
                  <button type="button" onClick={() => setEditingEmail(false)}
                    className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Batal</button>
                </>
              ) : (
                <button type="button" onClick={() => { setNewEmail(profile?.email || ""); setEditingEmail(true); }}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Ubah</button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <div className="mt-1 flex gap-2">
              <input
                value={editingUsername ? newUsername : profile?.username || ""}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={!editingUsername}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue ${editingUsername ? "border-gray-300" : "border-gray-200 bg-gray-50 text-gray-500"}`}
              />
              {editingUsername ? (
                <>
                  <button type="button" onClick={() => { usernameMutation.mutate(newUsername); setEditingUsername(false); }}
                    className="px-3 py-2 bg-komuna-blue text-white text-sm rounded-lg hover:bg-komuna-navy">Simpan</button>
                  <button type="button" onClick={() => setEditingUsername(false)}
                    className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Batal</button>
                </>
              ) : (
                <button type="button" onClick={() => { setNewUsername(profile?.username || ""); setEditingUsername(true); }}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Ubah</button>
              )}
            </div>
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

          <div className="flex items-center justify-between">
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* Interests Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Minat & Ketertarikan</h2>
          <button
            type="button"
            onClick={() => {
              if (editingInterests) {
                setEditingInterests(false);
              } else {
                setInterestsText((profile?.interests || []).join(", "));
                setEditingInterests(true);
              }
            }}
            className="text-sm text-komuna-blue hover:underline font-medium"
          >
            {editingInterests ? "Batal" : "Ubah"}
          </button>
        </div>

        {editingInterests ? (
          <div className="space-y-3">
            <textarea
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue resize-none"
              placeholder="Masukkan minat, pisahkan dengan koma (contoh: coding, musik, olahraga)"
            />
            <p className="text-xs text-gray-400">Pisahkan dengan koma. Maksimal 20 minat.</p>
            <button
              type="button"
              onClick={() => {
                const interests = interestsText.split(",").map(s => s.trim()).filter(s => s.length > 0);
                interestsMutation.mutate(interests);
                setEditingInterests(false);
              }}
              disabled={interestsMutation.isPending}
              className="px-4 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors"
            >
              {interestsMutation.isPending ? "Menyimpan..." : "Simpan Minat"}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-komuna-blue/10 text-komuna-blue text-sm rounded-full">
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada minat yang ditambahkan.</p>
            )}
          </div>
        )}
      </div>

      {/* Communities Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Komunitas yang Diikuti</h2>
        {profile?.communities && profile.communities.length > 0 ? (
          <div className="space-y-3">
            {profile.communities.map((community: any) => (
              <div key={community.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {community.logo ? (
                  <img src={community.logo} alt={community.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-komuna-blue/20 flex items-center justify-center text-komuna-blue text-sm font-bold">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{community.name}</p>
                  <p className="text-xs text-gray-500">{community.role}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Belum bergabung dengan komunitas manapun.</p>
        )}
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event yang Diikuti</h2>
        {profile?.events && profile.events.length > 0 ? (
          <div className="space-y-3">
            {profile.events.map((event: any) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {event.coverImage ? (
                  <img src={event.coverImage} alt={event.title} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-komuna-blue/20 flex items-center justify-center text-komuna-blue text-xs font-bold">
                    Event
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {event.registrationStatus && ` - ${event.registrationStatus}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Belum terdaftar di event manapun.</p>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ubah Password</h2>
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-komuna-blue hover:underline font-medium"
          >
            {showPasswordForm ? "Batal" : "Ubah Password"}
          </button>
        </div>

        {showPasswordForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Baru</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
              />
              <p className="mt-1 text-xs text-gray-400">Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
                  setError("Semua field password wajib diisi");
                  return;
                }
                if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
                  setError("Password baru tidak cocok");
                  return;
                }
                passwordMutation.mutate(passwordForm);
              }}
              disabled={passwordMutation.isPending}
              className="px-6 py-2.5 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors"
            >
              {passwordMutation.isPending ? "Menyimpan..." : "Simpan Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
