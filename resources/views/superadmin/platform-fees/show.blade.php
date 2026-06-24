@extends('layouts.app')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('superadmin.platform-fees.index') }}" class="text-gray-400 hover:text-gray-600">&larr;</a>
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Platform Fee #{{ $platformFee->id }}</h1>
        </div>
    </div>
</div>

<div class="max-w-2xl">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Detail Transaksi</h3>
        <div class="space-y-4">
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Event</span>
                <span class="font-medium text-gray-900">{{ $platformFee->event->title ?? '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Komunitas</span>
                <span class="font-medium text-gray-900">{{ $platformFee->event->community?->name ?? '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Pembayar</span>
                <span class="font-medium text-gray-900">{{ $platformFee->registration?->user?->name ?? '-' }}</span>
            </div>
            <hr class="border-gray-100">
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Gross Amount</span>
                <span class="font-bold text-gray-900">Rp {{ number_format($platformFee->gross_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Platform Fee ({{ $platformFee->platform_fee_percent }}%)</span>
                <span class="font-bold text-emerald-600">Rp {{ number_format($platformFee->platform_fee_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Community Net Income</span>
                <span class="font-bold text-blue-600">Rp {{ number_format($platformFee->community_net_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Status</span>
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{{ ucfirst($platformFee->status) }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Tanggal</span>
                <span class="font-medium text-gray-900">{{ $platformFee->created_at->format('d M Y H:i') }}</span>
            </div>
        </div>
    </div>
</div>
@endsection
