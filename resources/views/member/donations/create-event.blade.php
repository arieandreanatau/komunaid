@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('events.show', $event->slug) }}" class="text-komuna-light-text hover:text-komuna-muted">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Donasi untuk Event</h1>
            <p class="text-komuna-muted">{{ $event->title }}</p>
        </div>
    </div>
</div>

<div class="max-w-xl">
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
        <form method="POST" action="{{ route('member.donations.store-event', $event->slug) }}">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Jumlah Donasi (Rp)</label>
                    <input type="number" name="amount" min="1000" max="100000000" value="{{ old('amount') }}" required
                        class="w-full border border-komuna-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                        placeholder="Masukkan jumlah donasi">
                    @error('amount') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Pesan (Opsional)</label>
                    <textarea name="message" rows="3"
                        class="w-full border border-komuna-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
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
