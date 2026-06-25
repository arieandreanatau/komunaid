@extends('layouts.admin')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-komuna-text">{{ $proposal->title }}</h1>
        <p class="text-komuna-muted">Detail proposal kolaborasi.</p>
    </div>
    <a href="{{ route('superadmin.collaborations.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Kembali</a>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-bold text-komuna-text mb-4">Informasi Proposal</h2>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">ID</span><span class="font-medium text-komuna-text">#{{ $proposal->id }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Judul</span><span class="font-medium text-komuna-text">{{ $proposal->title }}</span></div>
                @php $sc = ['draft'=>'bg-komuna-border-soft text-komuna-text','sent'=>'bg-blue-100 text-blue-800','reviewed'=>'bg-purple-100 text-purple-800','accepted'=>'bg-green-100 text-green-800','rejected'=>'bg-red-100 text-red-800','completed'=>'bg-emerald-100 text-emerald-800','cancelled'=>'bg-yellow-100 text-yellow-800','archived'=>'bg-komuna-border-soft text-komuna-muted']; @endphp
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Status</span><span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $sc[$proposal->status] ?? '' }}">{{ ucfirst($proposal->status) }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Proposer</span><span class="font-medium text-komuna-text">{{ ucfirst($proposal->proposer_type) }} #{{ $proposal->proposer_id }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Target</span><span class="font-medium text-komuna-text">{{ ucfirst($proposal->target_type) }} #{{ $proposal->target_id }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Tipe</span><span class="font-medium text-komuna-text">{{ $proposal->collaborationType->name ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Budget</span><span class="font-medium text-komuna-text">{{ $proposal->estimated_budget ? 'Rp ' . number_format($proposal->estimated_budget, 0, ',', '.') : '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Dibuat</span><span class="font-medium text-komuna-text">{{ $proposal->created_at?->format('d M Y H:i') }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Dikirim</span><span class="font-medium text-komuna-text">{{ $proposal->sent_at?->format('d M Y H:i') ?? '-' }}</span></div>
            </div>
        </div>
        @if($proposal->description)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6"><h2 class="text-lg font-bold text-komuna-text mb-3">Deskripsi</h2><p class="text-komuna-muted text-sm whitespace-pre-wrap">{{ $proposal->description }}</p></div>
        @endif
        @if($proposal->response_note)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Response Note</h3><p class="text-komuna-muted text-sm">{{ $proposal->response_note }}</p></div>
        @endif
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Moderasi</h3>
            <div class="space-y-2">
                @if(!in_array($proposal->status, ['archived']))
                    <form method="POST" action="{{ route('superadmin.collaborations.archive', $proposal) }}">@csrf<div class="mb-2"><input type="text" name="reason" placeholder="Alasan archive" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm" maxlength="1000"></div><button type="submit" class="w-full bg-komuna-navy-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-navy-dark transition">Archive</button></form>
                @endif
            </div>
        </div>
        @if($proposal->attachment_path)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                <h3 class="font-semibold text-komuna-text text-sm mb-2">Lampiran</h3>
                <a href="{{ Storage::url($proposal->attachment_path) }}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Lihat Lampiran</a>
            </div>
        @endif
    </div>
</div>
@endsection
