@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Buat Regional Baru</h1>
    <p class="text-komuna-muted">{{ $community->name }}</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.regions.store', $community) }}" method="POST" class="space-y-6">
        @csrf

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Nama Regional *</label>
            <input type="text" name="name" value="{{ old('name') }}" required
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('name') border-komuna-danger @enderror"
                placeholder="Contoh: Bandung Utara">
            @error('name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kota</label>
                <input type="text" name="city" value="{{ old('city') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Provinsi</label>
                <input type="text" name="province" value="{{ old('province') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="3"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description') }}</textarea>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Buat Regional
            </button>
            <a href="{{ route('community.regions.index', $community) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
