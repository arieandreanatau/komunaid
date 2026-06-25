@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Buat Komunitas Baru</h1>
    <p class="text-komuna-muted">Isi form berikut untuk membuat komunitas baru.</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.communities.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Nama Komunitas *</label>
                <input type="text" name="name" value="{{ old('name') }}" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('name') border-komuna-danger @enderror">
                @error('name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kategori *</label>
                <select name="category_id" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('category_id') border-komuna-danger @enderror">
                    <option value="">Pilih Kategori</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ old('category_id') == $cat->id ? 'selected' : '' }}>{{ $cat->icon }} {{ $cat->name }}</option>
                    @endforeach
                </select>
                @error('category_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Komunitas *</label>
                <select name="community_type" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="open" {{ old('community_type') === 'open' ? 'selected' : '' }}>Open - Siapapun bisa join</option>
                    <option value="closed" {{ old('community_type') === 'closed' ? 'selected' : '' }}>Closed - Perlu approval</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Visibilitas *</label>
                <select name="visibility" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="public" {{ old('visibility') === 'public' ? 'selected' : '' }}>Public - Tampil di direktori</option>
                    <option value="private" {{ old('visibility') === 'private' ? 'selected' : '' }}>Private - Invite only</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Lokasi / Region</label>
                <input type="text" name="region" value="{{ old('region') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Contoh: Jawa Barat">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kota</label>
                <input type="text" name="city" value="{{ old('city') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Contoh: Bandung">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Email</label>
                <input type="email" name="contact_email" value="{{ old('contact_email') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Website</label>
                <input type="url" name="website" value="{{ old('website') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="https://...">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Instagram</label>
                <input type="text" name="instagram" value="{{ old('instagram') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="@username">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Social Media Lainnya</label>
                <input type="text" name="social_media" value="{{ old('social_media') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Twitter/X, LinkedIn, dll">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Max Members</label>
                <input type="number" name="max_members" value="{{ old('max_members') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Kosongkan jika tanpa batas">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Logo</label>
                <input type="file" name="logo" accept="image/*"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="3"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description') }}</textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">About / Detail Komunitas</label>
            <textarea name="about" rows="5"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('about') }}</textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Banner</label>
            <input type="file" name="banner" accept="image/*"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Buat Komunitas
            </button>
            <a href="{{ route('community.communities.index') }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
