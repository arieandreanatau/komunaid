@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">{{ $proposal->title }}</h1>
        <p class="text-komuna-muted">Detail proposal kolaborasi.</p>
    </div>
    <a href="{{ route('brand.proposals.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Kembali</a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-bold text-komuna-text mb-4">Informasi Proposal</h2>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Judul</span><span class="font-medium text-komuna-text">{{ $proposal->title }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Status</span>
                    @php
                        $statusColors = ['draft'=>'bg-komuna-border-soft text-komuna-text','sent'=>'bg-komuna-light text-komuna-blue','reviewed'=>'bg-komuna-info-soft text-komuna-info','accepted'=>'bg-komuna-success-soft text-komuna-success','rejected'=>'bg-komuna-danger-soft text-komuna-danger','completed'=>'bg-komuna-success-soft text-komuna-success','cancelled'=>'bg-komuna-warning-soft text-komuna-warning'];
                    @endphp
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$proposal->status] ?? '' }}">{{ ucfirst($proposal->status) }}</span>
                </div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Tipe</span><span class="font-medium text-komuna-text">{{ $proposal->collaborationType->name ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Budget</span><span class="font-medium text-komuna-text">{{ $proposal->estimated_budget ? 'Rp ' . number_format($proposal->estimated_budget, 0, ',', '.') : '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Timeline</span><span class="font-medium text-komuna-text">{{ $proposal->timeline ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Dikirim</span><span class="font-medium text-komuna-text">{{ $proposal->sent_at?->format('d M Y H:i') ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Dibuat</span><span class="font-medium text-komuna-text">{{ $proposal->created_at?->format('d M Y H:i') }}</span></div>
            </div>
        </div>

        @if($proposal->description)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
                <h2 class="text-lg font-bold text-komuna-text mb-3">Deskripsi</h2>
                <p class="text-komuna-muted text-sm whitespace-pre-wrap">{{ $proposal->description }}</p>
            </div>
        @endif

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if($proposal->objective)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Objektif</h3><p class="text-komuna-muted text-sm">{{ $proposal->objective }}</p></div>
            @endif
            @if($proposal->target_audience)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Target Audience</h3><p class="text-komuna-muted text-sm">{{ $proposal->target_audience }}</p></div>
            @endif
            @if($proposal->benefit_for_brand)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Benefit Brand</h3><p class="text-komuna-muted text-sm">{{ $proposal->benefit_for_brand }}</p></div>
            @endif
            @if($proposal->benefit_for_community)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5"><h3 class="font-semibold text-komuna-text text-sm mb-2">Benefit Komunitas</h3><p class="text-komuna-muted text-sm">{{ $proposal->benefit_for_community }}</p></div>
            @endif
        </div>

        @if($proposal->attachment_path)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                <h3 class="font-semibold text-komuna-text text-sm mb-2">Lampiran</h3>
                <a href="{{ Storage::url($proposal->attachment_path) }}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Lihat Lampiran</a>
            </div>
        @endif

        @if($proposal->response_note)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                <h3 class="font-semibold text-komuna-text text-sm mb-2">Catatan Response</h3>
                <p class="text-komuna-muted text-sm">{{ $proposal->response_note }}</p>
            </div>
        @endif
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Target</h3>
            <p class="text-sm text-komuna-muted">{{ $proposal->target->name ?? '-' }}</p>
            <p class="text-xs text-komuna-muted mt-1">{{ ucfirst($proposal->target_type) }}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Aksi</h3>
            <div class="space-y-2">
                @if($proposal->status === 'draft')
                    <form method="POST" action="{{ route('brand.proposals.send', $proposal) }}">
                        @csrf
                        <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition" onclick="return confirm('Kirim proposal ini?')">Kirim Proposal</button>
                    </form>
                    <a href="{{ route('brand.proposals.edit', $proposal) }}" class="block text-center bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Edit</a>
                @endif
                @if(in_array($proposal->status, ['draft', 'sent', 'reviewed']))
                    <form method="POST" action="{{ route('brand.proposals.cancel', $proposal) }}">
                        @csrf
                        <button type="submit" class="w-full bg-komuna-danger-soft text-komuna-danger px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition" onclick="return confirm('Batalkan proposal ini?')">Batalkan</button>
                    </form>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
