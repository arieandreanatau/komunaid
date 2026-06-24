@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Platform Fee Reports</h1>
    <p class="text-gray-600">Laporan pendapatan platform dari event berbayar.</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white">
        <p class="text-sm text-emerald-100">Platform Revenue</p>
        <p class="text-2xl font-bold mt-1">Rp {{ number_format($summary['total_fee'], 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <p class="text-sm text-gray-500">Total Gross Income</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">Rp {{ number_format($summary['total_gross'], 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <p class="text-sm text-gray-500">Total Transaksi</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ $summary['total_transactions'] }}</p>
    </div>
</div>

@if(count($monthlyStats) > 0)
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 class="font-semibold text-gray-900 mb-4">Ringkasan Bulanan</h3>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-100">
                        <th class="text-left py-2 px-3 font-medium text-gray-500">Bulan</th>
                        <th class="text-right py-2 px-3 font-medium text-gray-500">Gross</th>
                        <th class="text-right py-2 px-3 font-medium text-gray-500">Platform Fee</th>
                        <th class="text-right py-2 px-3 font-medium text-gray-500">Net (Community)</th>
                        <th class="text-right py-2 px-3 font-medium text-gray-500">Transaksi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($monthlyStats as $month)
                        <tr class="border-b border-gray-50">
                            <td class="py-2 px-3 text-gray-900">{{ $month['month'] }}/{{ $month['year'] }}</td>
                            <td class="py-2 px-3 text-right text-gray-600">Rp {{ number_format($month['total_gross'], 0, ',', '.') }}</td>
                            <td class="py-2 px-3 text-right font-semibold text-emerald-600">Rp {{ number_format($month['total_fee'], 0, ',', '.') }}</td>
                            <td class="py-2 px-3 text-right text-blue-600">Rp {{ number_format($month['total_net'], 0, ',', '.') }}</td>
                            <td class="py-2 px-3 text-right text-gray-900">{{ $month['total_transactions'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endif

<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">Detail Transaksi</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">ID</th>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">Event</th>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">Komunitas</th>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">User</th>
                    <th class="text-right py-3 px-3 font-medium text-gray-500">Gross</th>
                    <th class="text-right py-3 px-3 font-medium text-gray-500">Fee ({{ $report->first()->platform_fee_percent ?? 10 }}%)</th>
                    <th class="text-right py-3 px-3 font-medium text-gray-500">Net</th>
                    <th class="text-center py-3 px-3 font-medium text-gray-500">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($report as $fee)
                    <tr class="border-t border-gray-50 hover:bg-gray-50">
                        <td class="py-3 px-3 text-gray-600">#{{ $fee->id }}</td>
                        <td class="py-3 px-3 text-gray-900">{{ $fee->event->title ?? '-' }}</td>
                        <td class="py-3 px-3 text-gray-900">{{ $fee->event->community?->name ?? '-' }}</td>
                        <td class="py-3 px-3 text-gray-900">{{ $fee->registration?->user?->name ?? '-' }}</td>
                        <td class="py-3 px-3 text-right text-gray-900">Rp {{ number_format($fee->gross_amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-right font-semibold text-emerald-600">Rp {{ number_format($fee->platform_fee_amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-right text-blue-600">Rp {{ number_format($fee->community_net_amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-center">
                            <a href="{{ route('superadmin.platform-fees.show', $fee) }}" class="text-emerald-600 hover:underline text-xs">Detail</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="py-8 text-center text-gray-400">Belum ada data platform fee.</td>
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
