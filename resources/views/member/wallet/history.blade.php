@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('member.wallet.index') }}" class="text-komuna-light-text hover:text-komuna-muted">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Riwayat Transaksi</h1>
            <p class="text-komuna-muted">Seluruh histori transaksi wallet Anda.</p>
        </div>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-komuna-muted">Saldo: <span class="font-bold text-komuna-success">Rp {{ number_format($wallet->balance, 0, ',', '.') }}</span></p>
    </div>

    @if($transactions->isEmpty())
        <div class="text-center py-8 text-komuna-light-text">
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
                        <th class="text-right py-3 px-2 font-medium text-komuna-muted">Sebelum</th>
                        <th class="text-right py-3 px-2 font-medium text-komuna-muted">Jumlah</th>
                        <th class="text-right py-3 px-2 font-medium text-komuna-muted">Sesudah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transactions as $tx)
                        <tr class="border-b border-komuna-border-soft hover:bg-komuna-surface">
                            <td class="py-3 px-2 text-komuna-muted">{{ $tx->created_at->format('d M Y H:i') }}</td>
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
                            <td class="py-3 px-2 text-right text-komuna-muted">Rp {{ number_format($tx->balance_before, 0, ',', '.') }}</td>
                            <td class="py-3 px-2 text-right font-semibold {{ $tx->isCredit() ? 'text-komuna-success' : 'text-komuna-danger' }}">
                                {{ $tx->isCredit() ? '+' : '-' }} Rp {{ number_format($tx->amount, 0, ',', '.') }}
                            </td>
                            <td class="py-3 px-2 text-right text-komuna-text font-medium">Rp {{ number_format($tx->balance_after, 0, ',', '.') }}</td>
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
