@extends('layouts.app')
@section('title', 'Brand Owner Dashboard')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Brand Owner Dashboard</h1>
    <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Brand</div>
            <div class="text-3xl font-bold text-navy">{{ $brands->count() }}</div>
            <div class="text-xs text-gray-400 mt-1">Pending: {{ $brands->where('status', 'pending')->count() }} | Approved: {{ $brands->where('status', 'approved')->count() }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Campaign</div>
            <div class="text-3xl font-bold text-blue">{{ $totalCampaigns }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Kolaborasi</div>
            <div class="text-3xl font-bold text-sky-blue">{{ $collaborations }}</div>
        </div>
    </div>
    <div class="bg-white rounded-xl p-6 border">
        <h2 class="text-lg font-bold text-navy mb-4">Brand Saya</h2>
        <div class="space-y-3">
            @forelse($brands as $brand)
                <a href="{{ route('brand-owner.brands.show', $brand->id) }}" class="flex items-center justify-between p-3 bg-soft-bg rounded-lg hover:shadow-sm transition">
                    <div>
                        <div class="font-medium text-sm">{{ $brand->name }}</div>
                        <div class="text-xs text-gray-400">{{ $brand->industry ?? '-' }} &bull; {{ $brand->status }} &bull; {{ $brand->campaigns_count ?? 0 }} campaign</div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium
                        @if($brand->status === 'approved') bg-green-100 text-green-800
                        @elseif($brand->status === 'pending') bg-yellow-100 text-yellow-800
                        @else bg-red-100 text-red-800
                        @endif">
                        {{ ucfirst($brand->status) }}
                    </span>
                </a>
            @empty
                <p class="text-gray-400 text-sm">Belum ada brand. <a href="{{ route('brand-owner.brands.create') }}" class="text-blue hover:underline">Buat sekarang</a></p>
            @endforelse
        </div>
    </div>
</div>
@endsection
