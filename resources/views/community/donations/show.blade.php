@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('community.donations.index') }}" class="text-komuna-light-text hover:text-komuna-muted">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Donasi #{{ $donation->id }}</h1>
        </div>
    </div>
</div>

<div class="max-w-2xl space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
        <h3 class="font-semibold text-komuna-text mb-4">Informasi Donasi</h3>
        <div class="space-y-3">
            <div class="flex justify-between text-sm">
                <span class="text-komuna-muted">Status</span>
                <span class="px-2 py-1 rounded-full text-xs font-medium
                    @if($donation->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                    @elseif($donation->status === 'confirmed') bg-komuna-success-soft text-komuna-success
                    @else bg-komuna-danger-soft text-komuna-danger @endif">
                    {{ ucfirst($donation->status) }}
                </span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-komuna-muted">Donatur</span>
                <span class="font-medium text-komuna-text">{{ $donation->donor->name }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-komuna-muted">Jumlah</span>
                <span class="font-bold text-komuna-text">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-komuna-muted">Tipe</span>
                <span class="font-medium text-komuna-text">{{ $donation->donation_type }}</span>
            </div>
            @if($donation->event)
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Event</span>
                    <span class="font-medium text-komuna-text">{{ $donation->event->title }}</span>
                </div>
            @endif
            @if($donation->message)
                <div class="pt-3 border-t border-komuna-border-soft">
                    <p class="text-sm text-komuna-muted mb-1">Pesan</p>
                    <p class="text-komuna-text">{{ $donation->message }}</p>
                </div>
            @endif
        </div>

        @if($donation->status === 'pending')
            <div class="flex gap-2 mt-6 pt-4 border-t border-komuna-border-soft">
                <form method="POST" action="{{ route('community.donations.confirm', $donation) }}">
                    @csrf
                    <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Konfirmasi Donasi</button>
                </form>
                <form method="POST" action="{{ route('community.donations.reject', $donation) }}">
                    @csrf
                    <button type="submit" class="px-4 py-2 bg-komuna-danger-soft text-komuna-danger rounded-lg text-sm font-medium hover:bg-red-200 transition">Tolak</button>
                </form>
            </div>
        @endif
    </div>
</div>
@endsection
