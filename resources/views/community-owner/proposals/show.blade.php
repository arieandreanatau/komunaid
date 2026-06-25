@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">{{ $proposal->title }}</h1>
        <p class="text-komuna-muted">Detail proposal kolaborasi masuk.</p>
    </div>
    <a href="{{ route('community.proposals.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Kembali</a>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-bold text-komuna-text mb-4">Informasi Proposal</h2>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Judul</span><span class="font-medium text-komuna-text">{{ $proposal->title }}</span></div>
                @php $sc = ['sent'=>'bg-blue-100 text-blue-800','reviewed'=>'bg-purple-100 text-purple-800','accepted'=>'bg-green-100 text-green-800','rejected'=>'bg-red-100 text-red-800','completed'=>'bg-emerald-100 text-emerald-800','cancelled'=>'bg-yellow-100 text-yellow-800','archived'=>'bg-komuna-border-soft text-komuna-muted']; @endphp
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Status</span><span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $sc[$proposal->status] ?? '' }}">{{ ucfirst($proposal->status) }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Proposer</span><span class="font-medium text-komuna-text">{{ ucfirst($proposal->proposer_type) }} #{{ $proposal->proposer_id }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Tipe</span><span class="font-medium text-komuna-text">{{ $proposal->collaborationType->name ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Budget</span><span class="font-medium text-komuna-text">{{ $proposal->estimated_budget ? 'Rp ' . number_format($proposal->estimated_budget, 0, ',', '.') : '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Timeline</span><span class="font-medium text-komuna-text">{{ $proposal->timeline ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Dikirim</span><span class="font-medium text-komuna-text">{{ $proposal->sent_at?->format('d M Y H:i') ?? '-' }}</span></div>
            </div>
        </div>
        @if($proposal->description)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6"><h2 class="text-lg font-bold text-komuna-text mb-3">Deskripsi</h2><p class="text-komuna-muted text-sm whitespace-pre-wrap">{{ $proposal->description }}</p></div>
        @endif
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if($proposal->objective)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Objektif</h3><p class="text-komuna-muted text-sm">{{ $proposal->objective }}</p></div>
            @endif
            @if($proposal->benefit_for_community)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Benefit untuk Komunitas</h3><p class="text-komuna-muted text-sm">{{ $proposal->benefit_for_community }}</p></div>
            @endif
            @if($proposal->benefit_for_brand)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Benefit untuk Brand</h3><p class="text-komuna-muted text-sm">{{ $proposal->benefit_for_brand }}</p></div>
            @endif
            @if($proposal->target_audience)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Target Audience</h3><p class="text-komuna-muted text-sm">{{ $proposal->target_audience }}</p></div>
            @endif
        </div>
        @if($proposal->response_note)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Catatan Response</h3><p class="text-komuna-muted text-sm">{{ $proposal->response_note }}</p></div>
        @endif
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Aksi</h3>
            <div class="space-y-2">
                @if(in_array($proposal->status, ['sent']))
                    <form method="POST" action="{{ route('community.proposals.review', $proposal) }}">@csrf<button type="submit" class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Review</button></form>
                    <form method="POST" action="{{ route('community.proposals.accept', $proposal) }}">@csrf<button type="submit" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition" onclick="return confirm('Terima proposal ini?')">Terima</button></form>
                @endif
                @if(in_array($proposal->status, ['sent', 'reviewed']))
                    <form method="POST" action="{{ route('community.proposals.reject', $proposal) }}" id="rejectForm">
                        @csrf
                        <div class="mb-2">
                            <input type="text" name="response_note" placeholder="Alasan penolakan (wajib)" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm" required maxlength="1000">
                        </div>
                        <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition" onclick="return confirm('Tolak proposal ini?')">Tolak</button>
                    </form>
                @endif
                @if($proposal->status === 'accepted')
                    <form method="POST" action="{{ route('community.proposals.complete', $proposal) }}">@csrf<button type="submit" class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition" onclick="return confirm('Selesaikan proposal ini?')">Selesai</button></form>
                @endif
                @if(in_array($proposal->status, ['sent', 'reviewed']))
                    <form method="POST" action="{{ route('community.proposals.cancel', $proposal) }}">@csrf<button type="submit" class="w-full bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition" onclick="return confirm('Batalkan proposal ini?')">Batalkan</button></form>
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
