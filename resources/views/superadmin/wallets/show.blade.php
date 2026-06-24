@extends('layouts.app')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('superadmin.wallets.index') }}" class="text-gray-400 hover:text-gray-600">&larr;</a>
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Wallet: {{ $user->name }}</h1>
            <p class="text-gray-600">{{ $user->email }}</p>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1 space-y-6">
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 text-white">
            <p class="text-sm text-emerald-100">Saldo Saat Ini</p>
            <p class="text-3xl font-bold mt-1">Rp {{ number_format($wallet->balance, 0, ',', '.') }}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-3">Manual Adjustment</h3>
            <form method="POST" action="{{ route('superadmin.wallets.adjust', $user) }}">
                @csrf
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Jumlah (positif = credit, negatif = debit)</label>
                        <input type="number" name="amount" required step="1000"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="Contoh: 50000 atau -20000">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Deskripsi</label>
                        <input type="text" name="description" required maxlength="255"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="Alasan penyesuaian">
                    </div>
                    <button type="submit" class="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                        Proses Adjustment
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Riwayat Transaksi</h3>

            @if($transactions->isEmpty())
                <p class="text-gray-400 text-center py-6">Belum ada transaksi.</p>
            @else
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-2 px-2 font-medium text-gray-500">Tanggal</th>
                                <th class="text-left py-2 px-2 font-medium text-gray-500">Deskripsi</th>
                                <th class="text-left py-2 px-2 font-medium text-gray-500">Kategori</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($transactions as $tx)
                                <tr class="border-b border-gray-50">
                                    <td class="py-2 px-2 text-gray-600">{{ $tx->created_at->format('d M Y H:i') }}</td>
                                    <td class="py-2 px-2 text-gray-900">{{ $tx->description }}</td>
                                    <td class="py-2 px-2">
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {{ str_replace('_', ' ', $tx->category ?? 'other') }}
                                        </span>
                                    </td>
                                    <td class="py-2 px-2 text-right font-semibold {{ $tx->isCredit() ? 'text-emerald-600' : 'text-red-600' }}">
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
    </div>
</div>
@endsection
