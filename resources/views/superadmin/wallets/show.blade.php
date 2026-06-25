@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <div class="flex items-center gap-3">
        <a href="{{ route('superadmin.wallets.index') }}" class="text-[#64748B]/60 hover:text-[#64748B]">&larr;</a>
        <div>
            <h1 class="text-2xl font-bold text-[#0F172A]">Wallet: {{ $user->name }}</h1>
            <p class="text-[#64748B]">{{ $user->email }}</p>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1 space-y-6">
        <div class="bg-gradient-to-br from-[#16A34A] to-green-700 rounded-xl p-6 text-white">
            <p class="text-sm text-green-200">Saldo Saat Ini</p>
            <p class="text-3xl font-bold mt-1">Rp {{ number_format($wallet->balance, 0, ',', '.') }}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 class="font-semibold text-[#0F172A] mb-3">Manual Adjustment</h3>
            <form method="POST" action="{{ route('superadmin.wallets.adjust', $user) }}">
                @csrf
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-[#64748B] mb-1">Jumlah (positif = credit, negatif = debit)</label>
                        <input type="number" name="amount" required step="1000"
                            class="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#126BFF]"
                            placeholder="Contoh: 50000 atau -20000">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-[#64748B] mb-1">Deskripsi</label>
                        <input type="text" name="description" required maxlength="255"
                            class="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#126BFF]"
                            placeholder="Alasan penyesuaian">
                    </div>
                    <button type="submit" class="w-full bg-[#16A34A] text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                        Proses Adjustment
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 class="font-semibold text-[#0F172A] mb-4">Riwayat Transaksi</h3>

            @if($transactions->isEmpty())
                <p class="text-[#64748B]/60 text-center py-6">Belum ada transaksi.</p>
            @else
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-[#E2E8F0]">
                                <th class="text-left py-2 px-2 font-semibold text-[#0B2D89]">Tanggal</th>
                                <th class="text-left py-2 px-2 font-semibold text-[#0B2D89]">Deskripsi</th>
                                <th class="text-left py-2 px-2 font-semibold text-[#0B2D89]">Kategori</th>
                                <th class="text-right py-2 px-2 font-semibold text-[#0B2D89]">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($transactions as $tx)
                                <tr class="border-b border-[#E2E8F0]">
                                    <td class="py-2 px-2 text-[#64748B]">{{ $tx->created_at->format('d M Y H:i') }}</td>
                                    <td class="py-2 px-2 text-[#0F172A]">{{ $tx->description }}</td>
                                    <td class="py-2 px-2">
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF7FF]/50 text-[#64748B]">
                                            {{ str_replace('_', ' ', $tx->category ?? 'other') }}
                                        </span>
                                    </td>
                                    <td class="py-2 px-2 text-right font-semibold {{ $tx->isCredit() ? 'text-[#126BFF]' : 'text-[#DC2626]' }}">
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
