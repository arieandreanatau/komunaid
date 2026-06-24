@extends('layouts.app')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('community.donations.index') }}" class="text-gray-400 hover:text-gray-600">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Detail Donasi #{{ $donation->id }}</h1>
        </div>
    </div>
</div>

<div class="max-w-2xl space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Informasi Donasi</h3>
        <div class="space-y-3">
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
                <span class="text-gray-500">Donatur</span>
                <span class="font-medium text-gray-900">{{ $donation->donor->name }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Jumlah</span>
                <span class="font-bold text-gray-900">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Tipe</span>
                <span class="font-medium text-gray-900">{{ $donation->donation_type }}</span>
            </div>
            @if($donation->event)
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Event</span>
                    <span class="font-medium text-gray-900">{{ $donation->event->title }}</span>
                </div>
            @endif
            @if($donation->message)
                <div class="pt-3 border-t border-gray-100">
                    <p class="text-sm text-gray-500 mb-1">Pesan</p>
                    <p class="text-gray-900">{{ $donation->message }}</p>
                </div>
            @endif
        </div>

        @if($donation->status === 'pending')
            <div class="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                <form method="POST" action="{{ route('community.donations.confirm', $donation) }}">
                    @csrf
                    <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Konfirmasi Donasi</button>
                </form>
                <form method="POST" action="{{ route('community.donations.reject', $donation) }}">
                    @csrf
                    <button type="submit" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition">Tolak</button>
                </form>
            </div>
        @endif
    </div>
</div>
@endsection
