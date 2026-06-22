@extends('layouts.app')
@section('title', 'Detail Kolaborasi')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.collaborations.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">{{ $collaboration->title }}</h1>

    <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
            <div class="bg-white rounded-xl border p-6">
                <h2 class="text-lg font-bold text-navy mb-4">Detail Kolaborasi</h2>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><p class="text-gray-400 text-xs">Status</p>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium
                            @if($collaboration->status === 'approved') bg-green-100 text-green-800
                            @elseif($collaboration->status === 'pending') bg-yellow-100 text-yellow-800
                            @elseif($collaboration->status === 'rejected') bg-red-100 text-red-800
                            @else bg-gray-100 text-gray-800
                            @endif">{{ ucfirst($collaboration->status) }}</span>
                    </div>
                    <div><p class="text-gray-400 text-xs">Tipe</p><p class="font-medium">{{ ucfirst(str_replace('_', ' ', $collaboration->type)) }}</p></div>
                    <div><p class="text-gray-400 text-xs">Brand</p><p class="font-medium">{{ $collaboration->brand->name }}</p></div>
                    <div><p class="text-gray-400 text-xs">Komunitas</p><p class="font-medium">{{ $collaboration->community->name }}</p></div>
                    <div><p class="text-gray-400 text-xs">Campaign</p><p class="font-medium">{{ $collaboration->campaign?->title ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Dikirim Oleh</p><p class="font-medium">{{ $collaboration->initiator->name ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Tanggal Mulai</p><p class="font-medium">{{ $collaboration->start_date?->format('d M Y') ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Tanggal Selesai</p><p class="font-medium">{{ $collaboration->end_date?->format('d M Y') ?? '-' }}</p></div>
                </div>
                @if($collaboration->description)
                    <div class="mt-4">
                        <p class="text-gray-400 text-xs mb-1">Deskripsi</p>
                        <div class="text-sm whitespace-pre-line bg-soft-bg rounded-lg p-4">{{ $collaboration->description }}</div>
                    </div>
                @endif
            </div>
        </div>
        <div>
            <div class="bg-white rounded-xl border p-5">
                <h3 class="font-bold text-navy mb-3">Info</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">Dikirim</span><span class="font-medium">{{ $collaboration->created_at->format('d M Y') }}</span></div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
