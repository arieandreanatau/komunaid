@extends('layouts.dashboard')
@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Edit Transaksi</h1>
    <p class="text-komuna-muted">{{ $transaction->title }}</p>
</div>
<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.events.finance.update', [$event, $transaction]) }}" method="POST" class="space-y-6" enctype="multipart/form-data">
        @csrf @method('PUT')
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Type *</label><select name="type" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"><option value="income" {{ old('type', $transaction->type) === 'income' ? 'selected' : '' }}>Pendapatan</option><option value="expense" {{ old('type', $transaction->type) === 'expense' ? 'selected' : '' }}>Pengeluaran</option></select></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Category</label><input type="text" name="category" value="{{ old('category', $transaction->category) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Title *</label><input type="text" name="title" value="{{ old('title', $transaction->title) }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Amount (Rp) *</label><input type="number" name="amount" value="{{ old('amount', $transaction->amount) }}" required min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Tanggal *</label><input type="date" name="transaction_date" value="{{ old('transaction_date', $transaction->transaction_date->format('Y-m-d')) }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Status</label><select name="status" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"><option value="draft" {{ old('status', $transaction->status) === 'draft' ? 'selected' : '' }}>Draft</option><option value="pending" {{ old('status', $transaction->status) === 'pending' ? 'selected' : '' }}>Pending</option><option value="verified" {{ old('status', $transaction->status) === 'verified' ? 'selected' : '' }}>Verified</option></select></div>
            <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label><textarea name="description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description', $transaction->description) }}</textarea></div>
            @if($transaction->proof)
                <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Bukti Saat Ini</label><img src="{{ asset('storage/' . $transaction->proof) }}" class="w-full max-w-md rounded-lg"></div>
            @endif
            <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Ganti Bukti</label><input type="file" name="proof" accept="image/*" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
        </div>
        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Simpan Perubahan</button>
            <a href="{{ route('community.events.finance.index', $event) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection