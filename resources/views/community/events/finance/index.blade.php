@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Laporan Keuangan</h1>
        <p class="text-komuna-muted">{{ $event->title }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
        <a href="{{ route('community.events.finance.create', $event) }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">+ Tambah Transaksi</a>
    </div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
        <p class="text-sm text-komuna-success font-medium">Total Pendapatan</p>
        <p class="text-2xl font-bold text-komuna-success">Rp {{ number_format($totalIncome ?? 0) }}</p>
    </div>
    <div class="bg-komuna-danger-soft border border-red-200 rounded-2xl p-5">
        <p class="text-sm text-komuna-danger font-medium">Total Pengeluaran</p>
        <p class="text-2xl font-bold text-komuna-danger">Rp {{ number_format($totalExpense ?? 0) }}</p>
    </div>
    <div class="bg-komuna-light border border-blue-200 rounded-2xl p-5">
        <p class="text-sm text-komuna-blue font-medium">Saldo</p>
        <p class="text-2xl font-bold text-komuna-blue">Rp {{ number_format($balance ?? 0) }}</p>
    </div>
</div>
<div class="flex flex-wrap gap-2 mb-6">
    <a href="{{ route('community.events.finance.index', $event) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('type') ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Semua</a>
    <a href="{{ route('community.events.finance.index', array_merge(request()->all(), ['type' => 'income'])) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('type') === 'income' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Income</a>
    <a href="{{ route('community.events.finance.index', array_merge(request()->all(), ['type' => 'expense'])) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('type') === 'expense' ? 'bg-komuna-danger-soft text-komuna-danger' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Expense</a>
</div>
@if($transactions->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($transactions as $t)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium {{ $t->type === 'income' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-danger-soft text-komuna-danger' }}">{{ ucfirst($t->type) }}</span></td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $t->category ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm font-medium text-komuna-text">{{ $t->title }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-text font-medium">Rp {{ number_format($t->amount) }}</td>
                            <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium
                                @if($t->status === 'verified') bg-komuna-success-soft text-komuna-success
                                @elseif($t->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                @else bg-komuna-warning-soft text-komuna-warning @endif">{{ ucfirst($t->status) }}</span></td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $t->transaction_date->format('d M Y') }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('community.events.finance.edit', [$event, $t]) }}" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Edit</a>
                                    <form action="{{ route('community.events.finance.destroy', [$event, $t]) }}" method="POST" class="inline" onsubmit="return confirm('Hapus transaksi?')">@csrf@method('DELETE')<button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Hapus</button></form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $transactions->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Transaksi</h3>
        <p class="text-komuna-muted text-sm">Tambah transaksi keuangan pertama.</p>
    </div>
@endif
@endsection