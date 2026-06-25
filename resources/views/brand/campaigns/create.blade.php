@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Buat Campaign Baru</h1>
    <p class="text-komuna-muted">Isi form berikut untuk membuat campaign baru.</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('brand.campaigns.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Brand *</label>
                <select name="brand_id" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('brand_id') border-komuna-danger @enderror">
                    <option value="">Pilih Brand</option>
                    @foreach($brands as $brand)
                        <option value="{{ $brand->id }}" {{ old('brand_id') == $brand->id ? 'selected' : '' }}>{{ $brand->name }}</option>
                    @endforeach
                </select>
                @error('brand_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Judul Campaign *</label>
                <input type="text" name="title" value="{{ old('title') }}" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('title') border-komuna-danger @enderror">
                @error('title') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Campaign</label>
                <input type="text" name="campaign_type" value="{{ old('campaign_type') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Contoh: Awareness, Launch, Promo">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Target Audience</label>
                <input type="text" name="target_audience" value="{{ old('target_audience') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Contoh: Usia 18-35, Mahasiswa">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Mulai</label>
                <input type="date" name="start_date" value="{{ old('start_date') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Selesai</label>
                <input type="date" name="end_date" value="{{ old('end_date') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Budget (Rp)</label>
                <input type="number" name="budget" value="{{ old('budget') }}" min="0"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="0">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Gambar Campaign</label>
                <input type="file" name="image" accept="image/*"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="5"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description') }}</textarea>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                Buat Campaign
            </button>
            <a href="{{ route('brand.campaigns.index') }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
