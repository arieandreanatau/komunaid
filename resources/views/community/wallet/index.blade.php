@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Wallet Komunitas</h1>
    <p class="text-gray-600">Saldo dan transaksi ledger komunitas Anda.</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-sm p-6 text-white">
        <p class="text-sm font-medium text-emerald-100">Saldo Saat Ini</p>
        <p class="text-3xl font-bold mt-1">Rp {{ number_format($wallet->balance, 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <p class="text-sm font-medium text-gray-500">Pendapatan Event (Net)</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">Rp {{ number_format($totalEventIncome, 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <p class="text-sm font-medium text-gray-500">Total Donasi</p>
        <p class="text-2xl font-bold text-pink-600 mt-1">Rp {{ number_format($totalDonationIncome, 0, ',', '.') }}</p>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">Transaksi Terakhir</h2>
    </div>

    @if($transactions->isEmpty())
        <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-3">💰</div>
            <p>Belum ada transaksi.</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-100">
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Tanggal</th>
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Deskripsi</th>
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Kategori</th>
                        <th class="text-right py-3 px-2 font-medium text-gray-500">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transactions as $tx)
                        <tr class="border-b border-gray-50 hover:bg-gray-50">
                            <td class="py-3 px-2 text-gray-600">{{ $tx->created_at->format('d M Y') }}</td>
                            <td class="py-3 px-2 text-gray-900">{{ $tx->description }}</td>
                            <td class="py-3 px-2">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($tx->category === 'event_income') bg-blue-100 text-blue-800
                                    @elseif($tx->category === 'donation') bg-pink-100 text-pink-800
                                    @elseif($tx->category === 'manual_adjustment') bg-yellow-100 text-yellow-800
                                    @else bg-gray-100 text-gray-800 @endif">
                                    {{ str_replace('_', ' ', ucfirst($tx->category ?? 'other')) }}
                                </span>
                            </td>
                            <td class="py-3 px-2 text-right font-semibold {{ $tx->isCredit() ? 'text-emerald-600' : 'text-red-600' }}">
                                {{ $tx->isCredit() ? '+' : '-' }} Rp {{ number_format($tx->amount, 0, ',', '.') }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-4">
            {{ $transactions->links() }}
        </div>
    @endif
</div>
@endsection
