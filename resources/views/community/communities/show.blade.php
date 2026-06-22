@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Detail Komunitas</h1>
        <p class="text-gray-600">{{ $community->name }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.communities.edit', $community) }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Edit</a>
        <a href="{{ route('community.members.index', $community) }}" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Anggota</a>
        <a href="{{ route('community.regions.index', $community) }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Regional</a>
        <a href="{{ route('community.subgroups.index', $community) }}" class="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">Sub Komunitas</a>
    </div>
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
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($community->status === 'approved') bg-green-100 text-green-800
                        @elseif($community->status === 'pending') bg-yellow-100 text-yellow-800
                        @elseif($community->status === 'rejected') bg-red-100 text-red-800
                        @else bg-gray-100 text-gray-800
                        @endif">
                        {{ ucfirst($community->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Kategori</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->category->name ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Tipe Komunitas</p>
                    <p class="text-sm font-medium text-gray-900">{{ ucfirst($community->community_type) }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Visibilitas</p>
                    <p class="text-sm font-medium text-gray-900">{{ ucfirst($community->visibility) }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Slug</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->slug }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Lokasi</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->city ?? '-' }}, {{ $community->region ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Contact Email</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->contact_email ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Website</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->website ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Instagram</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->instagram ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Social Media</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->social_media ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Max Members</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->max_members ?? 'Unlimited' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Public</p>
                    <p class="text-sm font-medium text-gray-900">{{ $community->is_public ? 'Ya' : 'Tidak' }}</p>
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
                    <span class="text-gray-500">Total Anggota Aktif</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_members'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Regional</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_regions'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Sub Komunitas</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_subgroups'] }}</span>
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
            <a href="{{ route('community.regions.index', $community) }}" class="block text-center text-emerald-600 text-sm font-medium mt-3 hover:underline">Kelola Regional</a>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Sub Komunitas</h3>
            @if($community->subgroups->count() > 0)
                <div class="space-y-2">
                    @foreach($community->subgroups->take(5) as $subgroup)
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-700">{{ $subgroup->name }}</span>
                            <span class="text-xs text-gray-500">{{ $subgroup->status }}</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500 text-sm">Belum ada sub komunitas.</p>
            @endif
            <a href="{{ route('community.subgroups.index', $community) }}" class="block text-center text-emerald-600 text-sm font-medium mt-3 hover:underline">Kelola Sub Komunitas</a>
        </div>
    </div>
</div>
@endsection
