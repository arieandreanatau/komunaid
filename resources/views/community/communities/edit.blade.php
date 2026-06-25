@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Edit Komunitas</h1>
    <p class="text-komuna-muted">{{ $community->name }}</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.communities.update', $community) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
        @csrf
        @method('PUT')

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Nama Komunitas</label>
                <input type="text" name="name" value="{{ old('name', $community->name) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('name') border-komuna-danger @enderror">
                @error('name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kategori</label>
                <select name="category_id"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ old('category_id', $community->category_id) == $cat->id ? 'selected' : '' }}>{{ $cat->icon }} {{ $cat->name }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Komunitas</label>
                <select name="community_type"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="open" {{ old('community_type', $community->community_type) === 'open' ? 'selected' : '' }}>Open - Siapapun bisa join</option>
                    <option value="closed" {{ old('community_type', $community->community_type) === 'closed' ? 'selected' : '' }}>Closed - Perlu approval</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Visibilitas</label>
                <select name="visibility"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="public" {{ old('visibility', $community->visibility) === 'public' ? 'selected' : '' }}>Public - Tampil di direktori</option>
                    <option value="private" {{ old('visibility', $community->visibility) === 'private' ? 'selected' : '' }}>Private - Invite only</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Lokasi / Region</label>
                <input type="text" name="region" value="{{ old('region', $community->region) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kota</label>
                <input type="text" name="city" value="{{ old('city', $community->city) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Email</label>
                <input type="email" name="contact_email" value="{{ old('contact_email', $community->contact_email) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Website</label>
                <input type="url" name="website" value="{{ old('website', $community->website) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Instagram</label>
                <input type="text" name="instagram" value="{{ old('instagram', $community->instagram) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="@username">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Social Media Lainnya</label>
                <input type="text" name="social_media" value="{{ old('social_media', $community->social_media) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Max Members</label>
                <input type="number" name="max_members" value="{{ old('max_members', $community->max_members) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Logo (upload baru untuk ganti)</label>
                <input type="file" name="logo" accept="image/*"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                @if($community->logo)
                    <div class="mt-2">
                        <img src="{{ Storage::url($community->logo) }}" alt="Logo" class="w-16 h-16 rounded-lg object-cover">
                    </div>
                @endif
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="3"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description', $community->description) }}</textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">About / Detail Komunitas</label>
            <textarea name="about" rows="5"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('about', $community->about) }}</textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Banner (upload baru untuk ganti)</label>
            <input type="file" name="banner" accept="image/*"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            @if($community->banner)
                <div class="mt-2">
                    <img src="{{ Storage::url($community->banner) }}" alt="Banner" class="w-48 h-24 rounded-lg object-cover">
                </div>
            @endif
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Simpan Perubahan
            </button>
            <a href="{{ route('community.communities.show', $community) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
