@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Detail Komunitas</h1>
        <p class="text-gray-600">{{ $community->name }}</p>
    </div>
    <a href="{{ route('brand.community-directory.index') }}" class="text-gray-600 text-sm hover:text-gray-800">Kembali</a>
</div>

@if($community->banner)
    <div class="mb-6 rounded-2xl overflow-hidden h-48">
        <img src="{{ Storage::url($community->banner) }}" alt="Banner" class="w-full h-full object-cover">
    </div>
@endif

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Informasi Komunitas</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-gray-500">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Kategori</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->category->name ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Tipe</p>
                    <p class="text-sm font-medium text-gray-900">{{ ucfirst($community->community_type ?? '-') }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Lokasi</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->city ?? '-' }}{{ $community->region ? ', ' . $community->region : '' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Contact Email</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->contact_email ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Instagram</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->instagram ?? '-' }}</p>
                </div>
            </div>

            @if($community->description)
                <div class="mt-6">
                    <p class="text-xs text-gray-500 mb-1">Deskripsi</p>
                    <p class="text-sm text-gray-900">{{ $community->description }}</p>
                </div>
            @endif

            @if($community->about)
                <div class="mt-4">
                    <p class="text-xs text-gray-500 mb-1">About</p>
                    <div class="text-sm text-gray-900 whitespace-pre-line">{{ $community->about }}</div>
                </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Statistik</h3>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Total Member</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_members'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Regional</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_regions'] }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Regional</h3>
            @if($community->regions->count() > 0)
                <div class="space-y-2">
                    @foreach($community->regions->take(5) as $region)
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-700">{{ $region->name }}</span>
                            <span class="text-xs text-gray-500">{{ $region->city ?? '-' }}</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500 text-sm">Belum ada regional.</p>
            @endif
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Aksi</h3>
            <a href="{{ route('brand.collaborations.create') }}?community_id={{ $community->id }}" class="block w-full text-center bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Ajukan Kolaborasi
            </a>
        </div>
    </div>
</div>
@endsection
