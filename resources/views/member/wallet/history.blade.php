@extends('layouts.app')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('member.wallet.index') }}" class="text-gray-400 hover:text-gray-600">&larr;</a>
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
            <p class="text-gray-600">Seluruh histori transaksi wallet Anda.</p>
        </div>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-500">Saldo: <span class="font-bold text-emerald-600">Rp {{ number_format($wallet->balance, 0, ',', '.') }}</span></p>
    </div>

    @if($transactions->isEmpty())
        <div class="text-center py-8 text-gray-400">
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
                        <th class="text-right py-3 px-2 font-medium text-gray-500">Sebelum</th>
                        <th class="text-right py-3 px-2 font-medium text-gray-500">Jumlah</th>
                        <th class="text-right py-3 px-2 font-medium text-gray-500">Sesudah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transactions as $tx)
                        <tr class="border-b border-gray-50 hover:bg-gray-50">
                            <td class="py-3 px-2 text-gray-600">{{ $tx->created_at->format('d M Y H:i') }}</td>
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
                            <td class="py-3 px-2 text-right text-gray-500">Rp {{ number_format($tx->balance_before, 0, ',', '.') }}</td>
                            <td class="py-3 px-2 text-right font-semibold {{ $tx->isCredit() ? 'text-emerald-600' : 'text-red-600' }}">
                                {{ $tx->isCredit() ? '+' : '-' }} Rp {{ number_format($tx->amount, 0, ',', '.') }}
                            </td>
                            <td class="py-3 px-2 text-right text-gray-900 font-medium">Rp {{ number_format($tx->balance_after, 0, ',', '.') }}</td>
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
