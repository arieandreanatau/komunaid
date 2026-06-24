@extends('layouts.app')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('superadmin.donations.index') }}" class="text-gray-400 hover:text-gray-600">&larr;</a>
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Donasi #{{ $donation->id }}</h1>
        </div>
    </div>
</div>

<div class="max-w-2xl">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                <span class="text-gray-500">Donatur</span>
                <span class="font-medium text-gray-900">{{ $donation->donor->name }} ({{ $donation->donor->email }})</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Jumlah</span>
                <span class="font-bold text-lg text-gray-900">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span>
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
            @if($donation->community)
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Komunitas</span>
                    <span class="font-medium text-gray-900">{{ $donation->community->name }}</span>
                </div>
            @endif
            @if($donation->brand)
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Brand (CSR)</span>
                    <span class="font-medium text-gray-900">{{ $donation->brand->name }}</span>
                </div>
            @endif
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

            @if($donation->status === 'pending')
                <div class="flex gap-2 pt-4 border-t border-gray-100">
                    <form method="POST" action="{{ route('superadmin.donations.confirm', $donation) }}">
                        @csrf
                        <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Konfirmasi</button>
                    </form>
                    <form method="POST" action="{{ route('superadmin.donations.reject', $donation) }}">
                        @csrf
                        <input type="hidden" name="admin_notes" value="Ditolak oleh superadmin">
                        <button type="submit" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition">Tolak</button>
                    </form>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
