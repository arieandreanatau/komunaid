@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Wallet</h1>
    <p class="text-komuna-muted">Saldo dan transaksi internal Anda.</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-sm p-6 text-white">
        <p class="text-sm font-medium text-emerald-100">Saldo Saat Ini</p>
        <p class="text-3xl font-bold mt-1">Rp {{ number_format($wallet->balance, 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-komuna-border-soft">
        <p class="text-sm font-medium text-komuna-muted">Total Masuk</p>
        <p class="text-2xl font-bold text-komuna-success mt-1">Rp {{ number_format($totalCredits, 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-komuna-border-soft">
        <p class="text-sm font-medium text-komuna-muted">Total Keluar</p>
        <p class="text-2xl font-bold text-komuna-danger mt-1">Rp {{ number_format($totalDebits, 0, ',', '.') }}</p>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-komuna-text">Transaksi Terakhir</h2>
        <a href="{{ route('member.wallet.history') }}" class="text-komuna-success text-sm font-medium hover:underline">Lihat Semua</a>
    </div>

    @if($transactions->isEmpty())
        <div class="text-center py-8 text-komuna-light-text">
            <div class="text-4xl mb-3">💰</div>
            <p>Belum ada transaksi.</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-komuna-border-soft">
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Tanggal</th>
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Deskripsi</th>
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Kategori</th>
                        <th class="text-right py-3 px-2 font-medium text-komuna-muted">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transactions as $tx)
                        <tr class="border-b border-komuna-border-soft hover:bg-komuna-surface">
                            <td class="py-3 px-2 text-komuna-muted">{{ $tx->created_at->format('d M Y') }}</td>
                            <td class="py-3 px-2 text-komuna-text">{{ $tx->description }}</td>
                            <td class="py-3 px-2">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($tx->category === 'event_income') bg-komuna-light text-komuna-blue
                                    @elseif($tx->category === 'donation') bg-pink-100 text-pink-800
                                    @elseif($tx->category === 'manual_adjustment') bg-komuna-warning-soft text-komuna-warning
                                    @else bg-komuna-border-soft text-komuna-text @endif">
                                    {{ str_replace('_', ' ', ucfirst($tx->category ?? 'other')) }}
                                </span>
                            </td>
                            <td class="py-3 px-2 text-right font-semibold {{ $tx->isCredit() ? 'text-komuna-success' : 'text-komuna-danger' }}">
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
