@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">Platform Fee Reports</h1>
    <p class="text-[#64748B]">Laporan pendapatan platform dari event berbayar.</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-gradient-to-br from-[#126BFF] to-[#0B2D89] rounded-xl p-5 text-white">
        <p class="text-sm text-blue-200">Platform Revenue</p>
        <p class="text-2xl font-bold mt-1">Rp {{ number_format($summary['total_fee'], 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-5 border border-[#E2E8F0]">
        <p class="text-sm text-[#64748B]">Total Gross Income</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">Rp {{ number_format($summary['total_gross'], 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-5 border border-[#E2E8F0]">
        <p class="text-sm text-[#64748B]">Total Transaksi</p>
        <p class="text-2xl font-bold text-[#0F172A] mt-1">{{ $summary['total_transactions'] }}</p>
    </div>
</div>

@if(count($monthlyStats) > 0)
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
        <h3 class="font-semibold text-[#0F172A] mb-4">Ringkasan Bulanan</h3>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-[#E2E8F0]">
                        <th class="text-left py-2 px-3 font-semibold text-[#0B2D89]">Bulan</th>
                        <th class="text-right py-2 px-3 font-semibold text-[#0B2D89]">Gross</th>
                        <th class="text-right py-2 px-3 font-semibold text-[#0B2D89]">Platform Fee</th>
                        <th class="text-right py-2 px-3 font-semibold text-[#0B2D89]">Net (Community)</th>
                        <th class="text-right py-2 px-3 font-semibold text-[#0B2D89]">Transaksi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($monthlyStats as $month)
                        <tr class="border-b border-[#E2E8F0]">
                            <td class="py-2 px-3 text-[#0F172A]">{{ $month['month'] }}/{{ $month['year'] }}</td>
                            <td class="py-2 px-3 text-right text-[#64748B]">Rp {{ number_format($month['total_gross'], 0, ',', '.') }}</td>
                            <td class="py-2 px-3 text-right font-semibold text-[#126BFF]">Rp {{ number_format($month['total_fee'], 0, ',', '.') }}</td>
                            <td class="py-2 px-3 text-right text-blue-600">Rp {{ number_format($month['total_net'], 0, ',', '.') }}</td>
                            <td class="py-2 px-3 text-right text-[#0F172A]">{{ $month['total_transactions'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endif

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
    <div class="p-6 border-b border-[#E2E8F0]">
        <h3 class="font-semibold text-[#0F172A]">Detail Transaksi</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">ID</th>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">Event</th>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">Komunitas</th>
                    <th class="text-left py-3 px-3 font-semibold text-[#0B2D89]">User</th>
                    <th class="text-right py-3 px-3 font-semibold text-[#0B2D89]">Gross</th>
                    <th class="text-right py-3 px-3 font-semibold text-[#0B2D89]">Fee ({{ $report->first()->platform_fee_percent ?? 10 }}%)</th>
                    <th class="text-right py-3 px-3 font-semibold text-[#0B2D89]">Net</th>
                    <th class="text-center py-3 px-3 font-semibold text-[#0B2D89]">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($report as $fee)
                    <tr class="border-t border-[#E2E8F0] hover:bg-[#EEF7FF]/50">
                        <td class="py-3 px-3 text-[#64748B]">#{{ $fee->id }}</td>
                        <td class="py-3 px-3 text-[#0F172A]">{{ $fee->event->title ?? '-' }}</td>
                        <td class="py-3 px-3 text-[#0F172A]">{{ $fee->event->community?->name ?? '-' }}</td>
                        <td class="py-3 px-3 text-[#0F172A]">{{ $fee->registration?->user?->name ?? '-' }}</td>
                        <td class="py-3 px-3 text-right text-[#0F172A]">Rp {{ number_format($fee->gross_amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-right font-semibold text-[#126BFF]">Rp {{ number_format($fee->platform_fee_amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-right text-blue-600">Rp {{ number_format($fee->community_net_amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-center">
                            <a href="{{ route('superadmin.platform-fees.show', $fee) }}" class="text-[#126BFF] hover:underline text-xs">Detail</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="py-8 text-center text-[#64748B]/60">Belum ada data platform fee.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="p-4">
        {{ $report->links() }}
    </div>
</div>
@endsection
