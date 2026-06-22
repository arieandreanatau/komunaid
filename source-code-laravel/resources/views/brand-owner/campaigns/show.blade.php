@extends('layouts.app')
@section('title', 'Detail Campaign')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.campaigns.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-navy">{{ $campaign->title }}</h1>
        <div class="flex items-center gap-2">
            <a href="{{ route('brand-owner.campaigns.edit', $campaign) }}" class="bg-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-navy transition">Edit</a>
            <form action="{{ route('brand-owner.campaigns.destroy', $campaign) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus?')">
                @csrf @method('DELETE')
                <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition">Hapus</button>
            </form>
        </div>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
            <div class="bg-white rounded-xl border p-6">
                <h2 class="text-lg font-bold text-navy mb-4">Detail Campaign</h2>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><p class="text-gray-400 text-xs">Status</p>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium
                            @if($campaign->status === 'active') bg-green-100 text-green-800
                            @elseif($campaign->status === 'draft') bg-gray-100 text-gray-800
                            @else bg-yellow-100 text-yellow-800
                            @endif">{{ ucfirst($campaign->status) }}</span>
                    </div>
                    <div><p class="text-gray-400 text-xs">Brand</p><p class="font-medium">{{ $campaign->brand->name }}</p></div>
                    <div><p class="text-gray-400 text-xs">Budget</p><p class="font-medium">Rp {{ number_format($campaign->budget ?? 0) }}</p></div>
                    <div><p class="text-gray-400 text-xs">Target Audience</p><p class="font-medium">{{ $campaign->target_audience ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Tanggal Mulai</p><p class="font-medium">{{ $campaign->start_date?->format('d M Y') ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Tanggal Selesai</p><p class="font-medium">{{ $campaign->end_date?->format('d M Y') ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Dibuat Oleh</p><p class="font-medium">{{ $campaign->creator->name ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Dibuat Pada</p><p class="font-medium">{{ $campaign->created_at->format('d M Y') }}</p></div>
                </div>
                @if($campaign->description)
                    <div class="mt-4">
                        <p class="text-gray-400 text-xs mb-1">Deskripsi</p>
                        <div class="text-sm whitespace-pre-line">{{ $campaign->description }}</div>
                    </div>
                @endif
            </div>
        </div>
        <div>
            <div class="bg-white rounded-xl border p-5">
                <h3 class="font-bold text-navy mb-3">Aksi</h3>
                <a href="{{ route('brand-owner.campaigns.edit', $campaign) }}" class="block w-full text-center bg-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-navy transition mb-2">Edit</a>
                <a href="{{ route('brand-owner.brands.show', $campaign->brand) }}" class="block w-full text-center bg-soft-bg text-navy px-4 py-2 rounded-lg text-sm hover:shadow-sm transition">Lihat Brand</a>
            </div>
        </div>
    </div>
</div>
@endsection
