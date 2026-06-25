@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Komunitas</h1>
        <p class="text-komuna-muted">{{ $community->name }}</p>
    </div>
    <a href="{{ route('brand.community-directory.index') }}" class="text-komuna-muted text-sm hover:text-komuna-text">Kembali</a>
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
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-komuna-success-soft text-komuna-success">Approved</span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Kategori</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->category->name ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tipe</p>
                    <p class="text-sm font-medium text-komuna-text">{{ ucfirst($community->community_type ?? '-') }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Lokasi</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->city ?? '-' }}{{ $community->region ? ', ' . $community->region : '' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Email</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->contact_email ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Instagram</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $community->instagram ?? '-' }}</p>
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
                    <span class="text-komuna-muted">Total Member</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_members'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Regional</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_regions'] }}</span>
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
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Aksi</h3>
            <a href="{{ route('brand.collaborations.create') }}?community_id={{ $community->id }}" class="block w-full text-center bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Ajukan Kolaborasi
            </a>
        </div>
    </div>
</div>
@endsection
