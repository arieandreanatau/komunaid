@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Campaign</h1>
        <p class="text-komuna-muted">{{ $campaign->title }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('brand.campaigns.edit', $campaign) }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Edit</a>
    </div>
</div>

@if($campaign->image)
    <div class="mb-6 rounded-2xl overflow-hidden h-48">
        <img src="{{ Storage::url($campaign->image) }}" alt="Campaign" class="w-full h-full object-cover">
    </div>
@endif

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Informasi Campaign</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-komuna-muted">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($campaign->status === 'active') bg-komuna-success-soft text-komuna-success
                        @elseif($campaign->status === 'draft') bg-komuna-border-soft text-komuna-text
                        @elseif($campaign->status === 'paused') bg-komuna-warning-soft text-komuna-warning
                        @elseif($campaign->status === 'completed') bg-komuna-light text-komuna-blue
                        @else bg-komuna-danger-soft text-komuna-danger
                        @endif">
                        {{ ucfirst($campaign->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Brand</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $campaign->brand->name }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tipe</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $campaign->campaign_type ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Target Audience</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $campaign->target_audience ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tanggal Mulai</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $campaign->start_date?->format('d M Y') ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tanggal Selesai</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $campaign->end_date?->format('d M Y') ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Budget</p>
                    <p class="text-sm font-medium text-komuna-text">Rp {{ number_format($campaign->budget ?? 0) }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Dibuat Oleh</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $campaign->creator->name ?? '-' }}</p>
                </div>
            </div>

            @if($campaign->description)
                <div class="mt-6">
                    <p class="text-xs text-komuna-muted mb-1">Deskripsi</p>
                    <div class="text-sm text-komuna-text whitespace-pre-line">{{ $campaign->description }}</div>
                </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Aksi</h3>
            <div class="space-y-2">
                <a href="{{ route('brand.campaigns.edit', $campaign) }}" class="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Edit Campaign</a>
                <form action="{{ route('brand.campaigns.destroy', $campaign) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus campaign ini?')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="block w-full text-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Hapus Campaign</button>
                </form>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Info</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Slug</span>
                    <span class="font-medium text-komuna-text">{{ $campaign->slug }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Dibuat</span>
                    <span class="font-medium text-komuna-text">{{ $campaign->created_at->format('d M Y') }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
