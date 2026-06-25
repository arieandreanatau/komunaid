@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Edit Brand</h1>
    <p class="text-komuna-muted">{{ $brand->name }}</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('brand.brands.update', $brand) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
        @csrf
        @method('PUT')

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Nama Brand</label>
                <input type="text" name="name" value="{{ old('name', $brand->name) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('name') border-komuna-danger @enderror">
                @error('name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Industri</label>
                <input type="text" name="industry" value="{{ old('industry', $brand->industry) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Website</label>
                <input type="url" name="website" value="{{ old('website', $brand->website) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Instagram</label>
                <input type="text" name="instagram" value="{{ old('instagram', $brand->instagram) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Person</label>
                <input type="text" name="contact_person" value="{{ old('contact_person', $brand->contact_person) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Email</label>
                <input type="email" name="contact_email" value="{{ old('contact_email', $brand->contact_email) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Phone</label>
                <input type="text" name="contact_phone" value="{{ old('contact_phone', $brand->contact_phone) }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Logo (upload baru untuk ganti)</label>
                <input type="file" name="logo" accept="image/*"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                @if($brand->logo)
                    <div class="mt-2">
                        <img src="{{ Storage::url($brand->logo) }}" alt="Logo" class="w-16 h-16 rounded-lg object-cover">
                    </div>
                @endif
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="3"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description', $brand->description) }}</textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Banner (upload baru untuk ganti)</label>
            <input type="file" name="banner" accept="image/*"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            @if($brand->banner)
                <div class="mt-2">
                    <img src="{{ Storage::url($brand->banner) }}" alt="Banner" class="w-48 h-24 rounded-lg object-cover">
                </div>
            @endif
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                Simpan Perubahan
            </button>
            <a href="{{ route('brand.brands.show', $brand) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
