@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Brand</h1>
        <p class="text-komuna-muted">{{ $brand->name }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('brand.brands.edit', $brand) }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Edit</a>
        <a href="{{ route('brand.staff.index', $brand) }}" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Staff</a>
    </div>
</div>

@if($brand->banner)
    <div class="mb-6 rounded-2xl overflow-hidden h-48">
        <img src="{{ Storage::url($brand->banner) }}" alt="Banner" class="w-full h-full object-cover">
    </div>
@endif

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Informasi Brand</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-komuna-muted">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($brand->status === 'approved') bg-komuna-success-soft text-komuna-success
                        @elseif($brand->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                        @elseif($brand->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                        @else bg-komuna-border-soft text-komuna-text
                        @endif">
                        {{ ucfirst($brand->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Industri</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $brand->industry ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Slug</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $brand->slug }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Website</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $brand->website ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Instagram</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $brand->instagram ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Person</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $brand->contact_person ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Email</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $brand->contact_email ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Phone</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $brand->contact_phone ?? '-' }}</p>
                </div>
            </div>

            @if($brand->description)
                <div class="mt-6">
                    <p class="text-xs text-komuna-muted mb-1">Deskripsi</p>
                    <p class="text-sm text-komuna-text">{{ $brand->description }}</p>
                </div>
            @endif
        </div>

        @if($brand->campaigns->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold text-komuna-text">Campaign</h2>
                    <a href="{{ route('brand.campaigns.index') }}" class="text-indigo-600 text-sm font-medium hover:underline">Lihat Semua</a>
                </div>
                <div class="space-y-3">
                    @foreach($brand->campaigns->take(5) as $campaign)
                        <a href="{{ route('brand.campaigns.show', $campaign) }}" class="block p-3 rounded-lg hover:bg-komuna-surface transition">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-medium text-komuna-text text-sm">{{ $campaign->title }}</p>
                                    <p class="text-xs text-komuna-muted mt-1">{{ $campaign->campaign_type ?? '-' }} &middot; {{ $campaign->start_date?->format('d M Y') ?? '-' }}</p>
                                </div>
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($campaign->status === 'active') bg-komuna-success-soft text-komuna-success
                                    @elseif($campaign->status === 'draft') bg-komuna-border-soft text-komuna-text
                                    @elseif($campaign->status === 'paused') bg-komuna-warning-soft text-komuna-warning
                                    @else bg-komuna-border-soft text-komuna-text
                                    @endif">
                                    {{ ucfirst($campaign->status) }}
                                </span>
                            </div>
                        </a>
                    @endforeach
                </div>
            </div>
        @endif
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Statistik</h3>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Total Staff</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_staff'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Total Campaign</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_campaigns'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Active Campaign</span>
                    <span class="font-medium text-komuna-text">{{ $stats['active_campaigns'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Kolaborasi</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_collaborations'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Pending Kolaborasi</span>
                    <span class="font-medium text-komuna-text">{{ $stats['pending_collaborations'] }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Staff</h3>
            @if($brand->activeMembers->count() > 0)
                <div class="space-y-2">
                    @foreach($brand->activeMembers->take(5) as $member)
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-komuna-text">{{ $member->user->name }}</span>
                            <span class="text-xs text-komuna-muted">{{ $member->role }}</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-komuna-muted text-sm">Belum ada staff.</p>
            @endif
            <a href="{{ route('brand.staff.index', $brand) }}" class="block text-center text-indigo-600 text-sm font-medium mt-3 hover:underline">Kelola Staff</a>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Aksi</h3>
            <div class="space-y-2">
                <a href="{{ route('brand.campaigns.create') }}" class="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Buat Campaign</a>
                <a href="{{ route('brand.collaborations.create') }}" class="block w-full text-center bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Ajukan Kolaborasi</a>
            </div>
        </div>
    </div>
</div>
@endsection
