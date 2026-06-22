@extends('layouts.app')
@section('title', 'Riwayat Transaksi')
@section('content')
<div class="max-w-4xl mx-auto px-4 py-8">
    <a href="{{ route('member.wallet.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali ke Wallet</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Riwayat Transaksi</h1>
    <div class="bg-white rounded-xl border overflow-hidden">
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
                <div class="p-4 text-center text-gray-400">Belum ada transaksi.</div>
            @endforelse
        </div>
    </div>
    <div class="mt-4">{{ $transactions->links() }}</div>
</div>
@endsection
