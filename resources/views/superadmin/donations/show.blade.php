@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('superadmin.donations.index') }}" class="text-[#64748B]/60 hover:text-[#64748B]">&larr;</a>
        <div>
            <h1 class="text-2xl font-bold text-[#0F172A]">Donasi #{{ $donation->id }}</h1>
        </div>
    </div>
</div>

<div class="max-w-2xl">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div class="space-y-4">
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Status</span>
                <span class="px-2 py-1 rounded-full text-xs font-medium
                    @if($donation->status === 'pending') bg-[#F59E0B]/10 text-[#F59E0B]
                    @elseif($donation->status === 'confirmed') bg-[#16A34A]/10 text-[#16A34A]
                    @else bg-[#DC2626]/10 text-[#DC2626] @endif">
                    {{ ucfirst($donation->status) }}
                </span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Donatur</span>
                <span class="font-medium text-[#0F172A]">{{ $donation->donor->name }} ({{ $donation->donor->email }})</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Jumlah</span>
                <span class="font-bold text-lg text-[#0F172A]">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-[#64748B]">Tipe</span>
                <span class="font-medium text-[#0F172A]">{{ $donation->donation_type }}</span>
            </div>
            @if($donation->event)
                <div class="flex justify-between text-sm">
                    <span class="text-[#64748B]">Event</span>
                    <span class="font-medium text-[#0F172A]">{{ $donation->event->title }}</span>
                </div>
            @endif
            @if($donation->community)
                <div class="flex justify-between text-sm">
                    <span class="text-[#64748B]">Komunitas</span>
                    <span class="font-medium text-[#0F172A]">{{ $donation->community->name }}</span>
                </div>
            @endif
            @if($donation->brand)
                <div class="flex justify-between text-sm">
                    <span class="text-[#64748B]">Brand (CSR)</span>
                    <span class="font-medium text-[#0F172A]">{{ $donation->brand->name }}</span>
                </div>
            @endif
            @if($donation->message)
                <div class="pt-4 border-t border-[#E2E8F0]">
                    <p class="text-sm text-[#64748B] mb-1">Pesan</p>
                    <p class="text-[#0F172A]">{{ $donation->message }}</p>
                </div>
            @endif
            @if($donation->confirmed_at)
                <div class="flex justify-between text-sm">
                    <span class="text-[#64748B]">Dikonfirmasi</span>
                    <span class="font-medium text-[#0F172A]">{{ $donation->confirmed_at->format('d M Y H:i') }}</span>
                </div>
            @endif

            @if($donation->status === 'pending')
                <div class="flex gap-2 pt-4 border-t border-[#E2E8F0]">
                    <form method="POST" action="{{ route('superadmin.donations.confirm', $donation) }}">
                        @csrf
                        <button type="submit" class="px-4 py-2 bg-[#16A34A] text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">Konfirmasi</button>
                    </form>
                    <form method="POST" action="{{ route('superadmin.donations.reject', $donation) }}">
                        @csrf
                        <input type="hidden" name="admin_notes" value="Ditolak oleh superadmin">
                        <button type="submit" class="px-4 py-2 bg-[#DC2626]/10 text-[#DC2626] rounded-lg text-sm font-medium hover:bg-[#DC2626]/20 transition">Tolak</button>
                    </form>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
