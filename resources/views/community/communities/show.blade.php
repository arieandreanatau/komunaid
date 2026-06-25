@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Komunitas</h1>
        <p class="text-komuna-muted">{{ $community->name }}</p>
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
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Informasi Komunitas</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-komuna-muted">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($community->status === 'approved') bg-komuna-success-soft text-komuna-success
                        @elseif($community->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                        @elseif($community->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                        @else bg-komuna-border-soft text-komuna-text
                        @endif">
                        {{ ucfirst($community->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Kategori</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->category->name ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tipe Komunitas</p>
                    <p class="text-sm font-medium text-komuna-text">{{ ucfirst($community->community_type) }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Visibilitas</p>
                    <p class="text-sm font-medium text-komuna-text">{{ ucfirst($community->visibility) }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Slug</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->slug }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Lokasi</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->city ?? '-' }}, {{ $community->region ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Email</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->contact_email ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Website</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->website ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Instagram</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->instagram ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Social Media</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->social_media ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Max Members</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->max_members ?? 'Unlimited' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Public</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->is_public ? 'Ya' : 'Tidak' }}</p>
                </div>
            </div>

            @if($community->description)
                <div class="mt-6">
                    <p class="text-xs text-komuna-muted mb-1">Deskripsi</p>
                    <p class="text-sm text-komuna-text">{{ $community->description }}</p>
                </div>
            @endif

            @if($community->about)
                <div class="mt-4">
                    <p class="text-xs text-komuna-muted mb-1">About</p>
                    <div class="text-sm text-komuna-text whitespace-pre-line">{{ $community->about }}</div>
                </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Statistik</h3>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Total Anggota Aktif</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_members'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Regional</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_regions'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Sub Komunitas</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_subgroups'] }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Regional</h3>
            @if($community->regions->count() > 0)
                <div class="space-y-2">
                    @foreach($community->regions->take(5) as $region)
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-komuna-text">{{ $region->name }}</span>
                            <span class="text-xs text-komuna-muted">{{ $region->city ?? '-' }}</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-komuna-muted text-sm">Belum ada regional.</p>
            @endif
            <a href="{{ route('community.regions.index', $community) }}" class="block text-center text-komuna-success text-sm font-medium mt-3 hover:underline">Kelola Regional</a>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Sub Komunitas</h3>
            @if($community->subgroups->count() > 0)
                <div class="space-y-2">
                    @foreach($community->subgroups->take(5) as $subgroup)
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-komuna-text">{{ $subgroup->name }}</span>
                            <span class="text-xs text-komuna-muted">{{ $subgroup->status }}</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-komuna-muted text-sm">Belum ada sub komunitas.</p>
            @endif
            <a href="{{ route('community.subgroups.index', $community) }}" class="block text-center text-komuna-success text-sm font-medium mt-3 hover:underline">Kelola Sub Komunitas</a>
        </div>
    </div>
</div>
@endsection
