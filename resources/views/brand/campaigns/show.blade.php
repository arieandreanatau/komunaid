@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Detail Campaign</h1>
        <p class="text-gray-600">{{ $campaign->title }}</p>
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
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Informasi Campaign</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-gray-500">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($campaign->status === 'active') bg-green-100 text-green-800
                        @elseif($campaign->status === 'draft') bg-gray-100 text-gray-800
                        @elseif($campaign->status === 'paused') bg-yellow-100 text-yellow-800
                        @elseif($campaign->status === 'completed') bg-blue-100 text-blue-800
                        @else bg-red-100 text-red-800
                        @endif">
                        {{ ucfirst($campaign->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Brand</p>
                    <p class="text-sm font-medium text-gray-900">{{ $campaign->brand->name }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Tipe</p>
                    <p class="text-sm font-medium text-gray-900">{{ $campaign->campaign_type ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Target Audience</p>
                    <p class="text-sm font-medium text-gray-900">{{ $campaign->target_audience ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Tanggal Mulai</p>
                    <p class="text-sm font-medium text-gray-900">{{ $campaign->start_date?->format('d M Y') ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Tanggal Selesai</p>
                    <p class="text-sm font-medium text-gray-900">{{ $campaign->end_date?->format('d M Y') ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Budget</p>
                    <p class="text-sm font-medium text-gray-900">Rp {{ number_format($campaign->budget ?? 0) }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Dibuat Oleh</p>
                    <p class="text-sm font-medium text-gray-900">{{ $campaign->creator->name ?? '-' }}</p>
                </div>
            </div>

            @if($campaign->description)
                <div class="mt-6">
                    <p class="text-xs text-gray-500 mb-1">Deskripsi</p>
                    <div class="text-sm text-gray-900 whitespace-pre-line">{{ $campaign->description }}</div>
                </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Aksi</h3>
            <div class="space-y-2">
                <a href="{{ route('brand.campaigns.edit', $campaign) }}" class="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Edit Campaign</a>
                <form action="{{ route('brand.campaigns.destroy', $campaign) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus campaign ini?')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="block w-full text-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Hapus Campaign</button>
                </form>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Info</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Slug</span>
                    <span class="font-medium text-gray-900">{{ $campaign->slug }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Dibuat</span>
                    <span class="font-medium text-gray-900">{{ $campaign->created_at->format('d M Y') }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
