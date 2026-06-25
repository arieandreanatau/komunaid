@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Dashboard Community Owner</h1>
    <p class="text-komuna-muted">Selamat datang, {{ $user->name }}!</p>
</div>

<x-alert />

<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">🏘</div>
            <div>
                <p class="text-xs text-komuna-muted">Komunitas</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_communities'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-light rounded-xl flex items-center justify-center text-komuna-blue font-bold text-lg">👥</div>
            <div>
                <p class="text-xs text-komuna-muted">Total Member</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_members'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-warning-soft rounded-xl flex items-center justify-center text-komuna-warning font-bold text-lg">📅</div>
            <div>
                <p class="text-xs text-komuna-muted">Event Total</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_events'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-info-soft rounded-xl flex items-center justify-center text-komuna-info font-bold text-lg">💳</div>
            <div>
                <p class="text-xs text-komuna-muted">Event Paid</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_events_paid'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">🎁</div>
            <div>
                <p class="text-xs text-komuna-muted">Event Free</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_events_free'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-danger-soft rounded-xl flex items-center justify-center text-komuna-danger font-bold text-lg">🤝</div>
            <div>
                <p class="text-xs text-komuna-muted">Kolaborasi</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_collaborations'] }}</p>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-light rounded-xl flex items-center justify-center text-komuna-blue font-bold text-lg">🕐</div>
            <div>
                <p class="text-xs text-komuna-muted">Pending</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['pending_communities'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">✓</div>
            <div>
                <p class="text-xs text-komuna-muted">Approved</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['approved_communities'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-warning-soft rounded-xl flex items-center justify-center text-komuna-warning font-bold text-lg">💰</div>
            <div>
                <p class="text-xs text-komuna-muted">Saldo Wallet</p>
                <p class="text-2xl font-bold text-komuna-text">Rp {{ number_format($stats['wallet_balance'], 0, ',', '.') }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">📈</div>
            <div>
                <p class="text-xs text-komuna-muted">Pendapatan Event</p>
                <p class="text-2xl font-bold text-komuna-text">Rp {{ number_format($stats['total_event_income'], 0, ',', '.') }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-danger-soft rounded-xl flex items-center justify-center text-komuna-danger font-bold text-lg">🚫</div>
            <div>
                <p class="text-xs text-komuna-muted">Banned</p>
                <p class="text-2xl font-bold text-komuna-text">{{ $stats['total_bans'] }}</p>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-komuna-text">Quick Actions</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <a href="{{ route('community.communities.create') }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition text-center">
                <div class="text-2xl mb-2">🏘</div>
                <p class="text-sm font-medium text-komuna-text">Buat Komunitas</p>
            </a>
            <a href="{{ route('community.events.index') }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition text-center">
                <div class="text-2xl mb-2">📅</div>
                <p class="text-sm font-medium text-komuna-text">Kelola Event</p>
            </a>
            <a href="{{ route('community.collaborations.index') }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition text-center">
                <div class="text-2xl mb-2">🤝</div>
                <p class="text-sm font-medium text-komuna-text">Collaboration</p>
            </a>
            <a href="{{ route('community.wallet.index') }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition text-center">
                <div class="text-2xl mb-2">💰</div>
                <p class="text-sm font-medium text-komuna-text">Wallet</p>
            </a>
            <a href="{{ route('community.donations.index') }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition text-center">
                <div class="text-2xl mb-2">❤️</div>
                <p class="text-sm font-medium text-komuna-text">Donasi</p>
            </a>
            <a href="{{ route('community.communities.index') }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition text-center">
                <div class="text-2xl mb-2">👥</div>
                <p class="text-sm font-medium text-komuna-text">Kelola Komunitas</p>
            </a>
        </div>

        <div class="mt-6">
            <h2 class="text-lg font-bold text-komuna-text mb-4">Komunitas Saya</h2>
            @if($ownedCommunities->count() > 0)
                <div class="space-y-3">
                    @foreach($ownedCommunities as $community)
                        <a href="{{ route('community.communities.show', $community) }}" class="block bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-komuna-blue to-komuna-cyan rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                    @if($community->logo)
                                        <img src="{{ Storage::url($community->logo) }}" alt="" class="w-full h-full object-cover">
                                    @else
                                        {{ substr($community->name, 0, 1) }}
                                    @endif
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <h3 class="font-semibold text-komuna-text text-sm truncate">{{ $community->name }}</h3>
                                        <x-status-badge :status="$community->status" />
                                    </div>
                                    <p class="text-xs text-komuna-muted mt-1">{{ $community->category->name ?? '-' }} &middot; {{ $community->city ?? '-' }}</p>
                                </div>
                            </div>
                        </a>
                    @endforeach
                </div>
            @else
                <x-empty-state
                    title="Belum Ada Komunitas"
                    description="Buat komunitas pertama Anda."
                    action-url="{{ route('community.communities.create') }}"
                    action-label="Buat Komunitas"
                />
            @endif
        </div>
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
                    <span class="font-medium text-komuna-text">Community Owner</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Username</span>
                    <span class="font-medium text-komuna-text">{{ $user->profile?->username ?? '-' }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-2">Statistik</h3>
            <p class="text-komuna-muted text-sm mb-3">Ringkasan aktivitas komunitas Anda.</p>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Event Paid</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_events_paid'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Event Free</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_events_free'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Kolaborasi</span>
                    <span class="font-medium text-komuna-text">{{ $stats['total_collaborations'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Donasi</span>
                    <span class="font-medium text-komuna-text">Rp {{ number_format($stats['total_donation_ledger']) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Saldo Wallet</span>
                    <span class="font-medium text-komuna-text">Rp {{ number_format($stats['wallet_balance'], 0, ',', '.') }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
