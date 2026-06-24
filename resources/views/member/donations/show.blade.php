@extends('layouts.app')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('member.donations.index') }}" class="text-gray-400 hover:text-gray-600">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Detail Donasi</h1>
            <p class="text-gray-600">Informasi donasi #{{ $donation->id }}</p>
        </div>
    </div>
</div>

<div class="max-w-2xl">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="space-y-4">
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Status</span>
                <span class="px-2 py-1 rounded-full text-xs font-medium
                    @if($donation->status === 'pending') bg-yellow-100 text-yellow-800
                    @elseif($donation->status === 'confirmed') bg-green-100 text-green-800
                    @else bg-red-100 text-red-800 @endif">
                    {{ ucfirst($donation->status) }}
                </span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Jumlah</span>
                <span class="font-bold text-gray-900">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Tipe</span>
                <span class="font-medium text-gray-900">{{ $donation->donation_type }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Tujuan</span>
                <span class="font-medium text-gray-900">{{ $donation->event?->title ?? $donation->community?->name ?? '-' }}</span>
            </div>
            @if($donation->message)
                <div class="pt-4 border-t border-gray-100">
                    <p class="text-sm text-gray-500 mb-1">Pesan</p>
                    <p class="text-gray-900">{{ $donation->message }}</p>
                </div>
            @endif
            @if($donation->confirmed_at)
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Dikonfirmasi</span>
                    <span class="font-medium text-gray-900">{{ $donation->confirmed_at->format('d M Y H:i') }}</span>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
