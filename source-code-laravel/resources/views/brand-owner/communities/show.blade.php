@extends('layouts.app')
@section('title', 'Detail Komunitas')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.communities.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>

    @if($community->banner)
        <div class="rounded-xl overflow-hidden h-48 mb-6">
            <img src="{{ Storage::url($community->banner) }}" alt="Banner" class="w-full h-full object-cover">
        </div>
    @endif

    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-navy">{{ $community->name }}</h1>
            <p class="text-gray-400 mt-1">{{ $community->category ?? '-' }} &bull; {{ $community->location ?? '-' }}</p>
        </div>
        <a href="{{ route('brand-owner.collaborations.create') }}?community_id={{ $community->id }}" class="bg-sky-blue text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">Ajukan Kolaborasi</a>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
            <div class="bg-white rounded-xl border p-6">
                <h2 class="text-lg font-bold text-navy mb-4">Informasi Komunitas</h2>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><p class="text-gray-400 text-xs">Status</p><span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span></div>
                    <div><p class="text-gray-400 text-xs">Kategori</p><p class="font-medium">{{ $community->category ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Lokasi</p><p class="font-medium">{{ $community->location ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Website</p><p class="font-medium">{{ $community->website ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Max Members</p><p class="font-medium">{{ $community->max_members ?? 'Unlimited' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Tipe</p><p class="font-medium">{{ $community->is_public ? 'Public' : 'Private' }}</p></div>
                </div>
                @if($community->description)
                    <div class="mt-4">
                        <p class="text-gray-400 text-xs mb-1">Deskripsi</p>
                        <p class="text-sm">{{ $community->description }}</p>
                    </div>
                @endif
            </div>
        </div>
        <div class="space-y-6">
            <div class="bg-white rounded-xl border p-5">
                <h3 class="font-bold text-navy mb-3">Statistik</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">Member Aktif</span><span class="font-medium">{{ $stats['total_members'] }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Event Public</span><span class="font-medium">{{ $stats['total_events'] }}</span></div>
                </div>
            </div>
            <div class="bg-white rounded-xl border p-5">
                <a href="{{ route('brand-owner.collaborations.create') }}?community_id={{ $community->id }}" class="block w-full text-center bg-sky-blue text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">Ajukan Kolaborasi</a>
            </div>
        </div>
    </div>
</div>
@endsection
