@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('superadmin.platform-fees.index') }}" class="text-[#64748B]/60 hover:text-[#64748B]">&larr;</a>
        <div>
            <h1 class="text-2xl font-bold text-[#0F172A]">Platform Fee #{{ $platformFee->id }}</h1>
        </div>
    </div>
</div>

<div class="max-w-2xl">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 class="font-semibold text-[#0F172A] mb-4">Detail Transaksi</h3>
        <div class="space-y-4">
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Event</span>
                <span class="font-medium text-[#0F172A]">{{ $platformFee->event->title ?? '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Komunitas</span>
                <span class="font-medium text-[#0F172A]">{{ $platformFee->event->community?->name ?? '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Pembayar</span>
                <span class="font-medium text-[#0F172A]">{{ $platformFee->registration?->user?->name ?? '-' }}</span>
            </div>
            <hr class="border-[#E2E8F0]">
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Gross Amount</span>
                <span class="font-bold text-[#0F172A]">Rp {{ number_format($platformFee->gross_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Platform Fee ({{ $platformFee->platform_fee_percent }}%)</span>
                <span class="font-bold text-[#126BFF]">Rp {{ number_format($platformFee->platform_fee_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Community Net Income</span>
                <span class="font-bold text-blue-600">Rp {{ number_format($platformFee->community_net_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Status</span>
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A]">{{ ucfirst($platformFee->status) }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Tanggal</span>
                <span class="font-medium text-[#0F172A]">{{ $platformFee->created_at->format('d M Y H:i') }}</span>
            </div>
        </div>
    </div>
</div>
@endsection
