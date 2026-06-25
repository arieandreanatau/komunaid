@extends('layouts.dashboard')

@section('content')
<div class="max-w-4xl mx-auto space-y-8">

    <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6 md:p-8">
        <h2 class="text-xl font-bold text-komuna-text mb-6">Foto Profil</h2>
        <div class="flex items-center gap-6">
            <div class="flex-shrink-0">
                @if($user->profile && $user->profile->profile_photo)
                    <img id="avatarPreview" src="{{ asset('storage/' . $user->profile->profile_photo) }}" alt="{{ $user->name }}" class="w-24 h-24 rounded-full object-cover border-4 border-komuna-blue">
                @else
                    <div id="avatarPreview" class="w-24 h-24 rounded-full bg-komuna-blue flex items-center justify-center text-white text-2xl font-bold">{{ strtoupper(substr($user->name, 0, 2)) }}</div>
                @endif
            </div>
            <div class="flex-1 space-y-3">
                <form action="{{ route('member.profile.update') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PATCH')
                    <input type="file" name="profile_photo" id="profile_photo" accept="image/*" class="block w-full text-sm text-komuna-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-komuna-blue file:text-white hover:file:bg-komuna-blue/90 file:cursor-pointer">
                    @error('profile_photo')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                    <button type="submit" class="mt-3 px-4 py-2 text-sm font-medium bg-komuna-blue text-white rounded-xl hover:bg-komuna-blue/90 transition">Upload Foto</button>
                </form>
                @if($user->profile && $user->profile->profile_photo)
                    <form action="{{ route('member.profile.avatar.delete') }}" method="POST" class="inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit" onclick="return confirm('Yakin ingin menghapus foto profil?')" class="px-4 py-2 text-sm font-medium text-komuna-danger border border-komuna-danger/30 rounded-xl hover:bg-komuna-danger/10 transition">Hapus Foto</button>
                    </form>
                @endif
            </div>
        </div>
    </div>

    <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6 md:p-8">
        <h2 class="text-xl font-bold text-komuna-text mb-6">Edit Profil</h2>
        <form action="{{ route('member.profile.update') }}" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PATCH')
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div>
                    <label for="name" class="block text-sm font-medium text-komuna-text mb-1.5">Nama Lengkap</label>
                    <input type="text" name="name" id="name" value="{{ old('name', $user->name) }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('name')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="display_name" class="block text-sm font-medium text-komuna-text mb-1.5">Nama Tampilan</label>
                    <input type="text" name="display_name" id="display_name" value="{{ old('display_name', $user->profile->display_name ?? '') }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('display_name')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="username" class="block text-sm font-medium text-komuna-text mb-1.5">Username</label>
                    <input type="text" name="username" id="username" value="{{ old('username', $user->username) }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('username')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-komuna-text mb-1.5">Email</label>
                    <input type="email" name="email" id="email" value="{{ old('email', $user->email) }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('email')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="phone" class="block text-sm font-medium text-komuna-text mb-1.5">Telepon</label>
                    <input type="text" name="phone" id="phone" value="{{ old('phone', $user->profile->phone ?? '') }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('phone')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="gender" class="block text-sm font-medium text-komuna-text mb-1.5">Jenis Kelamin</label>
                    <select name="gender" id="gender" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                        <option value="">Pilih</option>
                        <option value="male" {{ old('gender', $user->profile->gender ?? '') === 'male' ? 'selected' : '' }}>Laki-laki</option>
                        <option value="female" {{ old('gender', $user->profile->gender ?? '') === 'female' ? 'selected' : '' }}>Perempuan</option>
                        <option value="other" {{ old('gender', $user->profile->gender ?? '') === 'other' ? 'selected' : '' }}>Lainnya</option>
                    </select>
                    @error('gender')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="birthdate" class="block text-sm font-medium text-komuna-text mb-1.5">Tanggal Lahir</label>
                    <input type="date" name="birthdate" id="birthdate" value="{{ old('birthdate', $user->profile->birthdate ?? '') }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('birthdate')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div class="sm:col-span-2">
                    <label for="bio" class="block text-sm font-medium text-komuna-text mb-1.5">Bio</label>
                    <textarea name="bio" id="bio" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition resize-none">{{ old('bio', $user->profile->bio ?? '') }}</textarea>
                    @error('bio')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
            </div>

            <h3 class="text-lg font-semibold text-komuna-text mb-4">Lokasi</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div>
                    <label for="city" class="block text-sm font-medium text-komuna-text mb-1.5">Kota</label>
                    <input type="text" name="city" id="city" value="{{ old('city', $user->profile->city ?? '') }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('city')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="province" class="block text-sm font-medium text-komuna-text mb-1.5">Provinsi</label>
                    <input type="text" name="province" id="province" value="{{ old('province', $user->profile->province ?? '') }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('province')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="country" class="block text-sm font-medium text-komuna-text mb-1.5">Negara</label>
                    <input type="text" name="country" id="country" value="{{ old('country', $user->profile->country ?? '') }}" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('country')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div class="sm:col-span-2">
                    <label for="address" class="block text-sm font-medium text-komuna-text mb-1.5">Alamat</label>
                    <textarea name="address" id="address" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition resize-none">{{ old('address', $user->profile->address ?? '') }}</textarea>
                    @error('address')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
            </div>

            <h3 class="text-lg font-semibold text-komuna-text mb-4">Media Sosial</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div>
                    <label for="instagram_url" class="block text-sm font-medium text-komuna-text mb-1.5">Instagram URL</label>
                    <input type="url" name="instagram_url" id="instagram_url" value="{{ old('instagram_url', $user->profile->instagram_url ?? '') }}" placeholder="https://instagram.com/..." class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('instagram_url')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="linkedin_url" class="block text-sm font-medium text-komuna-text mb-1.5">LinkedIn URL</label>
                    <input type="url" name="linkedin_url" id="linkedin_url" value="{{ old('linkedin_url', $user->profile->linkedin_url ?? '') }}" placeholder="https://linkedin.com/in/..." class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('linkedin_url')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="website_url" class="block text-sm font-medium text-komuna-text mb-1.5">Website URL</label>
                    <input type="url" name="website_url" id="website_url" value="{{ old('website_url', $user->profile->website_url ?? '') }}" placeholder="https://..." class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('website_url')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
            </div>

            <h3 class="text-lg font-semibold text-komuna-text mb-4">Privasi</h3>
            <div class="mb-8">
                <label for="privacy" class="block text-sm font-medium text-komuna-text mb-1.5">Siapa yang bisa melihat profil Anda?</label>
                <select name="privacy" id="privacy" class="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    <option value="public" {{ old('privacy', $user->profile->privacy ?? 'public') === 'public' ? 'selected' : '' }}>Publik</option>
                    <option value="friends" {{ old('privacy', $user->profile->privacy ?? '') === 'friends' ? 'selected' : '' }}>Teman Saja</option>
                    <option value="private" {{ old('privacy', $user->profile->privacy ?? '') === 'private' ? 'selected' : '' }}>Privat</option>
                </select>
                @error('privacy')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
            </div>

            <div class="flex justify-end">
                <button type="submit" class="px-8 py-3 bg-komuna-blue text-white rounded-xl font-semibold hover:bg-komuna-blue/90 transition">Simpan Perubahan</button>
            </div>
        </form>
    </div>

    {{-- Password Update --}}
    <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6 md:p-8">
        <h2 class="text-xl font-bold text-komuna-text mb-6">Ubah Password</h2>
        <form action="{{ route('member.profile.password.update') }}" method="POST">
            @csrf
            @method('PUT')
            <div class="space-y-5 max-w-lg">
                <div>
                    <label for="current_password" class="block text-sm font-medium text-komuna-text mb-1.5">Password Saat Ini</label>
                    <input type="password" name="current_password" id="current_password" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('current_password')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-komuna-text mb-1.5">Password Baru</label>
                    <input type="password" name="password" id="password" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                    @error('password')<p class="text-sm text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-komuna-text mb-1.5">Konfirmasi Password Baru</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" class="w-full px-4 py-2.5 rounded-xl border border-komuna-border bg-komuna-light text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
                </div>
            </div>
            <div class="flex justify-end mt-6">
                <button type="submit" class="px-8 py-3 bg-komuna-teal text-white rounded-xl font-semibold hover:bg-komuna-teal/90 transition">Ubah Password</button>
            </div>
        </form>
    </div>
</div>

<script>
    document.getElementById('profile_photo')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const preview = document.getElementById('avatarPreview');
                if (preview.tagName === 'IMG') { preview.src = ev.target.result; }
                else { const img = document.createElement('img'); img.id = 'avatarPreview'; img.src = ev.target.result; img.className = 'w-24 h-24 rounded-full object-cover border-4 border-komuna-blue'; preview.replaceWith(img); }
            };
            reader.readAsDataURL(file);
        }
    });
</script>
@endsection
