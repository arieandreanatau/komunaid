@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('member.donations.index') }}" class="text-komuna-light-text hover:text-komuna-muted">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Donasi</h1>
            <p class="text-komuna-muted">Informasi donasi #{{ $donation->id }}</p>
        </div>
    </div>
</div>

<div class="max-w-2xl">
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
        <div class="space-y-4">
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
                <span class="text-komuna-muted">Jumlah</span>
                <span class="font-bold text-komuna-text">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-komuna-muted">Tipe</span>
                <span class="font-medium text-komuna-text">{{ $donation->donation_type }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-komuna-muted">Tujuan</span>
                <span class="font-medium text-komuna-text">{{ $donation->event?->title ?? $donation->community?->name ?? '-' }}</span>
            </div>
            @if($donation->message)
                <div class="pt-4 border-t border-komuna-border-soft">
                    <p class="text-sm text-komuna-muted mb-1">Pesan</p>
                    <p class="text-komuna-text">{{ $donation->message }}</p>
                </div>
            @endif
            @if($donation->confirmed_at)
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Dikonfirmasi</span>
                    <span class="font-medium text-komuna-text">{{ $donation->confirmed_at->format('d M Y H:i') }}</span>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
