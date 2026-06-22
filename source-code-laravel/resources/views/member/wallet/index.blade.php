@extends('layouts.app')
@section('title', 'Wallet')
@section('content')
<div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Wallet</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="bg-white rounded-xl border p-6 mb-6">
        <div class="text-center">
            <div class="text-sm text-gray-400 mb-1">Saldo Anda</div>
            <div class="text-4xl font-bold text-navy">Rp {{ number_format($wallet->balance ?? 0, 0, ',', '.') }}</div>
        </div>
    </div>
    <div class="bg-white rounded-xl border p-6 mb-6">
        <h2 class="font-bold text-navy mb-3">Top Up (Simulasi)</h2>
        <form action="{{ route('member.wallet.topup') }}" method="POST" class="flex gap-4">
            @csrf
            <input type="number" name="amount" placeholder="Jumlah (min 1000)" min="1000" max="1000000" required class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
            <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Top Up</button>
        </form>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
        <div class="p-4 border-b bg-soft-bg">
            <h2 class="font-bold text-navy">Riwayat Transaksi</h2>
        </div>
        <div class="divide-y">
            @forelse($transactions as $tx)
                <div class="p-4 flex items-center justify-between">
                    <div>
                        <div class="text-sm font-medium">{{ $tx->description }}</div>
                        <div class="text-xs text-gray-400">{{ $tx->created_at->format('d M Y H:i') }}</div>
                    </div>
                    <div class="font-bold {{ $tx->type === 'credit' ? 'text-green-600' : 'text-red-600' }}">
                        {{ $tx->type === 'credit' ? '+' : '-' }} Rp {{ number_format($tx->amount, 0, ',', '.') }}
                    </div>
                </div>
            @empty
                <div class="p-4 text-center text-gray-400 text-sm">Belum ada transaksi.</div>
            @endforelse
        </div>
    </div>
    <div class="mt-4">
        <a href="{{ route('member.wallet.history') }}" class="text-blue hover:underline text-sm">Lihat Semua Riwayat</a>
    </div>
</div>
@endsection
