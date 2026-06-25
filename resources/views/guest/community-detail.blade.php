@extends('layouts.public')

@section('content')
<div class="mb-6">
    <a href="{{ route('communities.directory') }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium inline-flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali ke Direktori
    </a>
</div>

@if(session('success'))
    <div class="mb-4 bg-komuna-success-soft border border-emerald-400 text-komuna-success px-4 py-3 rounded-xl text-sm">
        {{ session('success') }}
    </div>
@endif
@if(session('error'))
    <div class="mb-4 bg-komuna-danger-soft border border-red-400 text-komuna-danger px-4 py-3 rounded-xl text-sm">
        {{ session('error') }}
    </div>
@endif
@if(session('warning'))
    <div class="mb-4 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl text-sm">
        {{ session('warning') }}
    </div>
@endif

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
    <div class="h-40 sm:h-52 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 relative">
        @if($community->banner)
            <img src="{{ $community->banner }}" alt="{{ $community->name }}" class="w-full h-full object-cover">
        @endif
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-24"></div>
    </div>

    <div class="px-6 sm:px-8 pb-8">
        <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10 mb-6">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
                @if($community->logo)
                    <img src="{{ $community->logo }}" alt="{{ $community->name }}" class="w-full h-full object-cover">
                @else
                    <span class="text-3xl font-bold text-komuna-success">{{ substr($community->name, 0, 1) }}</span>
                @endif
            </div>
            <div class="flex-1">
                <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">{{ $community->name }}</h1>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="inline-block bg-komuna-success-soft text-komuna-success text-xs font-medium px-2.5 py-1 rounded-full">
                        {{ $community->category->icon }} {{ $community->category->name }}
                    </span>
                    @if($community->city)
                        <span class="text-komuna-light-text text-sm">📍 {{ $community->city }}{{ $community->region ? ', ' . $community->region : '' }}</span>
                    @endif
                </div>
            </div>
            <div class="sm:text-right">
                @guest
                    <a href="{{ route('login') }}" class="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow">
                        Login untuk Join
                    </a>
                @elseif($isBanned)
                    <div class="bg-komuna-danger-soft text-komuna-danger px-4 py-2.5 rounded-xl text-sm font-medium">
                        Anda dibanned dari komunitas ini
                    </div>
                @elseif($isMember)
                    <form method="POST" action="{{ route('community_action.leave', $community->slug) }}" onsubmit="return confirm('Yakin ingin keluar dari komunitas ini?')">
                        @csrf
                        <button type="submit" class="bg-komuna-danger-soft text-komuna-danger border border-red-200 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition">
                            Leave Community
                        </button>
                    </form>
                @elseif($joinCheck && !$joinCheck['allowed'])
                    <div class="bg-yellow-50 text-yellow-700 px-4 py-2.5 rounded-xl text-sm font-medium max-w-xs">
                        {{ $joinCheck['reason'] }}
                    </div>
                @else
                    <form method="POST" action="{{ route('community_action.join', $community->slug) }}">
                        @csrf
                        <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow">
                            Join Komunitas
                        </button>
                    </form>
                @endguest
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
                <div>
                    <h3 class="text-sm font-semibold text-komuna-muted uppercase tracking-wider mb-2">Deskripsi</h3>
                    <p class="text-komuna-text leading-relaxed">{{ $community->description }}</p>
                </div>

                @if($isLoggedIn && !$isBanned && ($isMember || $community->owner_id === auth()->id()))
                    @if($community->about)
                        <div>
                            <h3 class="text-sm font-semibold text-komuna-muted uppercase tracking-wider mb-2">Tentang Komunitas</h3>
                            <p class="text-komuna-text leading-relaxed">{{ $community->about }}</p>
                        </div>
                    @endif
                @elseif(!$isLoggedIn)
                    <div class="bg-komuna-surface rounded-xl p-6 text-center border border-komuna-border">
                        <p class="text-komuna-muted text-sm mb-3">Login untuk melihat informasi lengkap komunitas.</p>
                        <a href="{{ route('login') }}" class="text-komuna-success font-semibold text-sm hover:underline">Login Sekarang</a>
                    </div>
                @endif
            </div>

            <div class="space-y-6">
                <div class="bg-komuna-surface rounded-xl p-5 border border-komuna-border-soft">
                    <h4 class="font-semibold text-komuna-text mb-3">Info Komunitas</h4>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-komuna-muted">Members</span>
                            <span class="font-medium text-komuna-text">{{ $community->active_members_count ?? $community->activeMembers()->count() }}</span>
                        </div>
                        @if($isLoggedIn && !$isBanned)
                            @if($community->owner)
                                <div class="flex justify-between">
                                    <span class="text-komuna-muted">Owner</span>
                                    <span class="font-medium text-komuna-text">{{ $community->owner->name }}</span>
                                </div>
                            @endif
                        @endif
                        @if($community->city)
                            <div class="flex justify-between">
                                <span class="text-komuna-muted">Lokasi</span>
                                <span class="font-medium text-komuna-text">{{ $community->city }}</span>
                            </div>
                        @endif
                        <div class="flex justify-between">
                            <span class="text-komuna-muted">Status</span>
                            <span class="inline-block bg-komuna-success-soft text-komuna-success text-xs font-medium px-2 py-0.5 rounded-full">Approved</span>
                        </div>
                    </div>
                </div>

                @if(!$isLoggedIn)
                    <div class="bg-komuna-success-soft rounded-xl p-5 border border-emerald-100">
                        <h4 class="font-semibold text-emerald-900 mb-2">Mau Join?</h4>
                        <p class="text-komuna-success text-sm mb-3">Daftar atau login untuk bergabung dengan komunitas ini.</p>
                        <a href="{{ route('register') }}" class="block text-center bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                            Daftar Gratis
                        </a>
                    </div>
                @endif

                @if($isBanned)
                    <div class="bg-komuna-danger-soft rounded-xl p-5 border border-red-100">
                        <h4 class="font-semibold text-red-900 mb-1">Akses Dibatasi</h4>
                        <p class="text-komuna-danger text-sm">Anda telah dibanned dari komunitas ini dan tidak dapat melihat informasi lengkap.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
