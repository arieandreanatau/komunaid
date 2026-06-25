@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">{{ $proposal->title }}</h1>
        <p class="text-komuna-muted">Detail proposal kolaborasi.</p>
    </div>
    <a href="{{ route('company-owner.collaborations.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Kembali</a>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-bold text-komuna-text mb-4">Informasi Proposal</h2>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Judul</span><span class="font-medium text-komuna-text">{{ $proposal->title }}</span></div>
                @php $sc = ['draft'=>'bg-komuna-border-soft text-komuna-text','sent'=>'bg-komuna-light text-komuna-blue','accepted'=>'bg-komuna-success-soft text-komuna-success','rejected'=>'bg-komuna-danger-soft text-komuna-danger','completed'=>'bg-komuna-success-soft text-komuna-success']; @endphp
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Status</span><span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $sc[$proposal->status] ?? '' }}">{{ ucfirst($proposal->status) }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Tipe</span><span class="font-medium text-komuna-text">{{ $proposal->collaborationType->name ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Budget</span><span class="font-medium text-komuna-text">{{ $proposal->estimated_budget ? 'Rp ' . number_format($proposal->estimated_budget, 0, ',', '.') : '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Dikirim</span><span class="font-medium text-komuna-text">{{ $proposal->sent_at?->format('d M Y H:i') ?? '-' }}</span></div>
            </div>
        </div>
        @if($proposal->description)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6"><h2 class="text-lg font-bold text-komuna-text mb-3">Deskripsi</h2><p class="text-komuna-muted text-sm whitespace-pre-wrap">{{ $proposal->description }}</p></div>
        @endif
        @if($proposal->response_note)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Catatan Response</h3><p class="text-komuna-muted text-sm">{{ $proposal->response_note }}</p></div>
        @endif
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Target</h3>
            <p class="text-sm text-komuna-muted">{{ $proposal->target->name ?? '-' }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Aksi</h3>
            <div class="space-y-2">
                @if($proposal->status === 'draft')
                    <form method="POST" action="{{ route('company-owner.collaborations.send', $proposal) }}">@csrf<button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition" onclick="return confirm('Kirim proposal?')">Kirim Proposal</button></form>
                @endif
                @if(in_array($proposal->status, ['draft', 'sent', 'reviewed']))
                    <form method="POST" action="{{ route('company-owner.collaborations.cancel', $proposal) }}">@csrf<button type="submit" class="w-full bg-komuna-danger-soft text-komuna-danger px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition" onclick="return confirm('Batalkan proposal?')">Batalkan</button></form>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
