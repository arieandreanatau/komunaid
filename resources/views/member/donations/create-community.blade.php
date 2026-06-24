@extends('layouts.app')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('communities.detail', $community->slug) }}" class="text-gray-400 hover:text-gray-600">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Donasi untuk Komunitas</h1>
            <p class="text-gray-600">{{ $community->name }}</p>
        </div>
    </div>
</div>

<div class="max-w-xl">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form method="POST" action="{{ route('member.donations.store-community', $community->id) }}">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Donasi (Rp)</label>
                    <input type="number" name="amount" min="1000" max="100000000" value="{{ old('amount') }}" required
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Masukkan jumlah donasi">
                    @error('amount') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Pesan (Opsional)</label>
                    <textarea name="message" rows="3"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Tulis pesan untuk komunitas...">{{ old('message') }}</textarea>
                </div>
                <button type="submit" class="w-full bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition">
                    Kirim Donasi
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
