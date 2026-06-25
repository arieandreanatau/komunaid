@extends('layouts.dashboard')
@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Tambah Transaksi</h1>
    <p class="text-komuna-muted">{{ $event->title }}</p>
</div>
<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.events.finance.store', $event) }}" method="POST" class="space-y-6" enctype="multipart/form-data">
        @csrf
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Type *</label><select name="type" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"><option value="income">Pendapatan</option><option value="expense">Pengeluaran</option></select></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Category</label><input type="text" name="category" value="{{ old('category') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Title *</label><input type="text" name="title" value="{{ old('title') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Amount (Rp) *</label><input type="number" name="amount" value="{{ old('amount') }}" required min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Tanggal *</label><input type="date" name="transaction_date" value="{{ old('transaction_date') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Status</label><select name="status" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"><option value="draft">Draft</option><option value="pending">Pending</option><option value="verified">Verified</option></select></div>
            <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label><textarea name="description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description') }}</textarea></div>
            <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Bukti</label><input type="file" name="proof" accept="image/*" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
        </div>
        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Simpan Transaksi</button>
            <a href="{{ route('community.events.finance.index', $event) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection