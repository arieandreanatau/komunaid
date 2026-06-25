@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">Donation Management</h1>
    <p class="text-[#64748B]">Kelola seluruh donasi di platform.</p>
</div>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-xl shadow-sm p-4 border border-[#E2E8F0]">
        <p class="text-xs text-[#64748B]">Pending</p>
        <p class="text-2xl font-bold text-[#F59E0B]">{{ $stats['total_pending'] }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-[#E2E8F0]">
        <p class="text-xs text-[#64748B]">Confirmed</p>
        <p class="text-2xl font-bold text-[#16A34A]">{{ $stats['total_confirmed'] }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-[#E2E8F0]">
        <p class="text-xs text-[#64748B]">Rejected</p>
        <p class="text-2xl font-bold text-[#DC2626]">{{ $stats['total_rejected'] }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-[#E2E8F0]">
        <p class="text-xs text-[#64748B]">Total Amount</p>
        <p class="text-2xl font-bold text-[#126BFF]">Rp {{ number_format($stats['total_amount'], 0, ',', '.') }}</p>
    </div>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
    <div class="flex items-center gap-2 mb-4 flex-wrap">
        <a href="{{ route('superadmin.donations.index') }}" class="px-3 py-1 rounded-full text-xs font-medium {{ !request('status') ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#EEF7FF]/50 text-[#64748B]' }}">Semua</a>
        <a href="{{ route('superadmin.donations.index', ['status' => 'pending']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#EEF7FF]/50 text-[#64748B]' }}">Pending</a>
        <a href="{{ route('superadmin.donations.index', ['status' => 'confirmed']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'confirmed' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#EEF7FF]/50 text-[#64748B]' }}">Confirmed</a>
        <a href="{{ route('superadmin.donations.index', ['status' => 'rejected']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'rejected' ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-[#EEF7FF]/50 text-[#64748B]' }}">Rejected</a>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">ID</th>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">Donatur</th>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">Tipe</th>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">Tujuan</th>
                    <th class="text-right py-3 px-3 font-semibold text-[#0B2D89]">Jumlah</th>
                    <th class="text-center py-3 px-3 font-semibold text-[#0B2D89]">Status</th>
                    <th class="text-center py-3 px-3 font-semibold text-[#0B2D89]">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($donations as $donation)
                    <tr class="border-t border-[#E2E8F0] hover:bg-[#EEF7FF]/50">
                        <td class="py-3 px-3 text-[#64748B]">#{{ $donation->id }}</td>
                        <td class="py-3 px-3 text-[#0F172A]">{{ $donation->donor->name }}</td>
                        <td class="py-3 px-3 text-[#0F172A]">{{ $donation->donation_type }}</td>
                        <td class="py-3 px-3 text-[#0F172A]">{{ $donation->event?->title ?? $donation->community?->name ?? '-' }}</td>
                        <td class="py-3 px-3 text-right font-semibold text-[#0F172A]">Rp {{ number_format($donation->amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-center">
                            <span class="px-2 py-1 rounded-full text-xs font-medium
                                @if($donation->status === 'pending') bg-[#F59E0B]/10 text-[#F59E0B]
                                @elseif($donation->status === 'confirmed') bg-[#16A34A]/10 text-[#16A34A]
                                @else bg-[#DC2626]/10 text-[#DC2626] @endif">
                                {{ ucfirst($donation->status) }}
                            </span>
                        </td>
                        <td class="py-3 px-3 text-center">
                            <div class="flex items-center justify-center gap-1">
                                @if($donation->status === 'pending')
                                    <form method="POST" action="{{ route('superadmin.donations.confirm', $donation) }}" class="inline">
                                        @csrf
                                        <button type="submit" class="px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded text-xs hover:bg-[#16A34A]/20">Confirm</button>
                                    </form>
                                    <form method="POST" action="{{ route('superadmin.donations.reject', $donation) }}" class="inline">
                                        @csrf
                                        <button type="submit" class="px-2 py-1 bg-[#DC2626]/10 text-[#DC2626] rounded text-xs hover:bg-[#DC2626]/20">Reject</button>
                                    </form>
                                @endif
                                <a href="{{ route('superadmin.donations.show', $donation) }}" class="px-2 py-1 bg-[#EEF7FF]/50 text-[#64748B] rounded text-xs hover:bg-[#EEF7FF]">Detail</a>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="py-8 text-center text-[#64748B]/60">Tidak ada data donasi.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">
        {{ $donations->withQueryString()->links() }}
    </div>
</div>
@endsection
