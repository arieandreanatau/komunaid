@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Dashboard Brand Owner</h1>
    <p class="text-komuna-muted">Selamat datang, {{ $user->name }}!</p>
</div>

<x-alert />

<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-light rounded-xl flex items-center justify-center text-komuna-blue font-bold text-lg">🏷</div>
            <div>
                <p class="text-xs text-komuna-muted">Brand</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_brands'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-warning-soft rounded-xl flex items-center justify-center text-komuna-warning font-bold text-lg">⏳</div>
            <div>
                <p class="text-xs text-komuna-muted">Pending</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['pending_brands'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">✓</div>
            <div>
                <p class="text-xs text-komuna-muted">Approved</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['approved_brands'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-info-soft rounded-xl flex items-center justify-center text-komuna-info font-bold text-lg">📢</div>
            <div>
                <p class="text-xs text-komuna-muted">Campaign</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_campaigns'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-light rounded-xl flex items-center justify-center text-komuna-blue font-bold text-lg">🔥</div>
            <div>
                <p class="text-xs text-komuna-muted">Active Campaign</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['active_campaigns'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">🤝</div>
            <div>
                <p class="text-xs text-komuna-muted">Kolaborasi</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_collaborations'] }}</p>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-komuna-text">Brand Saya</h2>
            <a href="{{ route('brand.brands.create') }}" class="bg-komuna-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition">
                + Buat Brand
            </a>
        </div>

        @if(isset($ownedBrands) && $ownedBrands->count() > 0)
            <div class="space-y-3">
                @foreach($ownedBrands as $brand)
                    <a href="{{ route('brand.brands.show', $brand) }}" class="block bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-komuna-blue to-komuna-cyan rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                @if($brand->logo)
                                    <img src="{{ Storage::url($brand->logo) }}" alt="" class="w-full h-full object-cover">
                                @else
                                    {{ substr($brand->name, 0, 1) }}
                                @endif
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-komuna-text text-sm truncate">{{ $brand->name }}</h3>
                                    <x-status-badge :status="$brand->status" />
                                </div>
                                <p class="text-xs text-komuna-muted mt-1">{{ $brand->industry ?? '-' }} &middot; {{ $brand->activeMembers->count() }} staff</p>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        @else
            <x-empty-state
                title="Belum Ada Brand"
                description="Buat brand pertama Anda."
                action-url="{{ route('brand.brands.create') }}"
                action-label="Buat Brand"
            />
        @endif
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Akun</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Nama</span>
                    <span class="font-medium text-komuna-text">{{ $user->name }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Role</span>
                    <span class="font-medium text-komuna-text">Brand Owner</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Username</span>
                    <span class="font-medium text-komuna-text">{{ $user->profile?->username ?? '-' }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-2">Ringkasan</h3>
            <p class="text-komuna-muted text-sm mb-3">Aktivitas brand Anda.</p>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Pending Collaborations</span>
                    <span class="font-medium text-komuna-text">{{ $stats['pending_collaborations'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Active Campaigns</span>
                    <span class="font-medium text-komuna-text">{{ $stats['active_campaigns'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Total Collaborations</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_collaborations'] }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
