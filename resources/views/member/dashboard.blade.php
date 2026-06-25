@extends('layouts.dashboard')

@section('content')
<div class="space-y-8">

    {{-- Welcome Section --}}
    <div class="bg-komuna-surface rounded-2xl border border-komuna-border p-6 md:p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div class="flex-shrink-0">
                @if($user->profile && $user->profile->profile_photo)
                    <img src="{{ asset('storage/' . $user->profile->profile_photo) }}" alt="{{ $user->name }}" class="w-20 h-20 rounded-full object-cover border-4 border-komuna-blue">
                @else
                    <div class="w-20 h-20 rounded-full bg-komuna-blue flex items-center justify-center text-white text-2xl font-bold">{{ strtoupper(substr($user->name, 0, 2)) }}</div>
                @endif
            </div>
            <div class="flex-1 text-center sm:text-left">
                <h1 class="text-2xl font-bold text-komuna-text">Selamat Datang, {{ $user->name }}!</h1>
                <p class="text-komuna-muted mt-1">{{ $user->username }}</p>
                <span class="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-semibold {{ ($user->status ?? 'active') === 'active' ? 'bg-komuna-green/10 text-komuna-green' : 'bg-komuna-orange/10 text-komuna-orange' }}">{{ ($user->status ?? 'active') === 'active' ? 'Aktif' : ucfirst($user->status ?? 'Unknown') }}</span>
            </div>
        </div>
    </div>

    @php
        $profile = $user->profile;
        $completionMissing = !$profile || !$profile->bio || !$profile->city || ($user->interests && $user->interests->isEmpty());
    @endphp
    @if($completionMissing)
        <div class="bg-gradient-to-r from-komuna-blue/10 to-komuna-cyan/10 border border-komuna-blue/20 rounded-2xl p-6">
            <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-komuna-blue/20 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="flex-1 text-center sm:text-left">
                    <h3 class="font-semibold text-komuna-text">Lengkapi Profil Anda</h3>
                    <p class="text-sm text-komuna-muted mt-1">Lengkapi profil Anda untuk terhubung dengan komunitas yang tepat.</p>
                </div>
                <a href="{{ route('member.profile.edit') }}" class="px-5 py-2.5 bg-komuna-blue text-white rounded-xl font-medium hover:bg-komuna-blue/90 transition">Lengkapi Sekarang</a>
            </div>
        </div>
    @endif

    {{-- Metrics Grid --}}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <a href="{{ route('communities.directory') }}" class="bg-komuna-surface border border-komuna-border rounded-xl p-4 hover:shadow-lg transition group">
            <div class="w-10 h-10 bg-komuna-blue/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-komuna-blue/20 transition">
                <svg class="w-5 h-5 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <p class="text-2xl font-bold text-komuna-text">{{ $memberCount ?? 0 }}</p>
            <p class="text-xs text-komuna-muted mt-1">Komunitas</p>
        </a>
        <a href="{{ route('events.index') }}" class="bg-komuna-surface border border-komuna-border rounded-xl p-4 hover:shadow-lg transition group">
            <div class="w-10 h-10 bg-komuna-teal/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-komuna-teal/20 transition">
                <svg class="w-5 h-5 text-komuna-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <p class="text-2xl font-bold text-komuna-text">{{ $eventCount ?? 0 }}</p>
            <p class="text-xs text-komuna-muted mt-1">Event</p>
        </a>
        <div class="bg-komuna-surface border border-komuna-border rounded-xl p-4 hover:shadow-lg transition group">
            <div class="w-10 h-10 bg-komuna-green/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-komuna-green/20 transition">
                <svg class="w-5 h-5 text-komuna-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
            <p class="text-2xl font-bold text-komuna-text">{{ $friendsCount ?? 0 }}</p>
            <p class="text-xs text-komuna-muted mt-1">Teman</p>
        </div>
        <div class="bg-komuna-surface border border-komuna-border rounded-xl p-4 hover:shadow-lg transition group">
            <div class="w-10 h-10 bg-komuna-orange/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-komuna-orange/20 transition">
                <svg class="w-5 h-5 text-komuna-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            </div>
            <p class="text-2xl font-bold text-komuna-text">{{ $bookmarksCount ?? 0 }}</p>
            <p class="text-xs text-komuna-muted mt-1">Bookmark</p>
        </div>
        <div class="bg-komuna-surface border border-komuna-border rounded-xl p-4 hover:shadow-lg transition group">
            <div class="w-10 h-10 bg-komuna-cyan/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-komuna-cyan/20 transition">
                <svg class="w-5 h-5 text-komuna-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <p class="text-2xl font-bold text-komuna-text">{{ $galleryCount ?? 0 }}</p>
            <p class="text-xs text-komuna-muted mt-1">Galeri</p>
        </div>
        <a href="#" class="bg-komuna-surface border border-komuna-border rounded-xl p-4 hover:shadow-lg transition group">
            <div class="w-10 h-10 bg-komuna-navy/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-komuna-navy/20 transition">
                <svg class="w-5 h-5 text-komuna-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            </div>
            <p class="text-2xl font-bold text-komuna-text">{{ $interestsCount ?? 0 }}</p>
            <p class="text-xs text-komuna-muted mt-1">Interest</p>
        </a>
    </div>

    {{-- Two Column Layout --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {{-- Left Column: Komunitas Saya --}}
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-komuna-text">Komunitas Saya</h2>
                    <a href="{{ route('communities.directory') }}" class="text-sm text-komuna-blue hover:underline font-medium">Lihat Semua</a>
                </div>
                @if($joinedCommunities && $joinedCommunities->count() > 0)
                    <div class="space-y-3">
                        @foreach($joinedCommunities->take(6) as $community)
                            <a href="{{ route('communities.detail', $community->slug) }}" class="flex items-center gap-4 p-3 rounded-xl hover:bg-komuna-light transition">
                                <div class="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-komuna-light">
                                    @if($community->logo)
                                        <img src="{{ asset('storage/' . $community->logo) }}" alt="{{ $community->name }}" class="w-full h-full object-cover">
                                    @else
                                        <div class="w-full h-full bg-komuna-blue/10 flex items-center justify-center text-komuna-blue font-bold text-lg">{{ strtoupper(substr($community->name, 0, 1)) }}</div>
                                    @endif
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-komuna-text truncate">{{ $community->name }}</p>
                                    <p class="text-xs text-komuna-muted">{{ $community->category->name ?? '' }}</p>
                                </div>
                            </a>
                        @endforeach
                    </div>
                @else
                    <div class="text-center py-8">
                        <p class="text-komuna-muted">Anda belum bergabung di komunitas manapun.</p>
                        <a href="{{ route('communities.directory') }}" class="inline-flex items-center mt-3 px-5 py-2.5 bg-komuna-blue text-white rounded-xl font-medium hover:bg-komuna-blue/90 transition">Jelajahi Komunitas</a>
                    </div>
                @endif
            </div>
        </div>
        {{-- Right Column --}}
        <div class="space-y-6">

            {{-- Profil Card --}}
            <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6">
                <div class="flex items-center gap-4 mb-4">
                    @if($user->profile && $user->profile->profile_photo)
                        <img src="{{ asset('storage/' . $user->profile->profile_photo) }}" alt="{{ $user->name }}" class="w-14 h-14 rounded-full object-cover border-2 border-komuna-blue">
                    @else
                        <div class="w-14 h-14 rounded-full bg-komuna-blue flex items-center justify-center text-white text-lg font-bold">{{ strtoupper(substr($user->name, 0, 2)) }}</div>
                    @endif
                    <div>
                        <p class="font-bold text-komuna-text">{{ $user->name }}</p>
                        <p class="text-sm text-komuna-muted">@{{ $user->username }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 mb-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-komuna-blue/10 text-komuna-blue">{{ ucfirst(str_replace('_', ' ', $user->getRoleNames()->first() ?? 'member')) }}</span>
                </div>
                <a href="{{ route('member.profile.edit') }}" class="block w-full text-center px-4 py-2.5 border border-komuna-border rounded-xl text-komuna-text font-medium hover:bg-komuna-light transition text-sm">Edit Profil</a>
            </div>

            {{-- Event Mendatang --}}
            <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6">
                <h3 class="text-lg font-bold text-komuna-text mb-4">Event Mendatang</h3>
                @if(($upcomingEvents ?? collect())->count() > 0)
                    <div class="space-y-3">
                        @foreach(($upcomingEvents ?? collect())->take(4) as $registration)
                            <a href="{{ route('events.show', $registration->event->slug) }}" class="block p-3 rounded-xl hover:bg-komuna-light transition">
                                <p class="font-semibold text-komuna-text text-sm">{{ $registration->event->title }}</p>
                                <p class="text-xs text-komuna-muted mt-1">{{ $registration->event->start_datetime ? \Carbon\Carbon::parse($registration->event->start_datetime)->translatedFormat('d M Y, H:i') : '' }}</p>
                                <p class="text-xs text-komuna-muted">{{ $registration->event->community->name ?? '' }}</p>
                            </a>
                        @endforeach
                    </div>
                @else
                    <p class="text-sm text-komuna-muted text-center py-4">Tidak ada event mendatang.</p>
                @endif
            </div>
            {{-- Rekomendasi Komunitas --}}
            <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6">
                <h3 class="text-lg font-bold text-komuna-text mb-4">Rekomendasi Komunitas</h3>
                @if(($recommendedCommunities ?? collect())->count() > 0)
                    <div class="space-y-3">
                        @foreach(($recommendedCommunities ?? collect())->take(4) as $community)
                            <a href="{{ route('communities.detail', $community->slug) }}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-komuna-light transition">
                                <div class="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-komuna-light">
                                    @if($community->logo)
                                        <img src="{{ asset('storage/' . $community->logo) }}" alt="{{ $community->name }}" class="w-full h-full object-cover">
                                    @else
                                        <div class="w-full h-full bg-komuna-teal/10 flex items-center justify-center text-komuna-teal font-bold text-sm">{{ strtoupper(substr($community->name, 0, 1)) }}</div>
                                    @endif
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-komuna-text text-sm truncate">{{ $community->name }}</p>
                                    <p class="text-xs text-komuna-muted">{{ $community->member_count ?? 0 }} anggota</p>
                                </div>
                            </a>
                        @endforeach
                    </div>
                @else
                    <p class="text-sm text-komuna-muted text-center py-4">Tidak ada rekomendasi saat ini.</p>
                @endif
            </div>
        </div>
    </div>

    {{-- CTA Buttons --}}
    <div class="flex flex-col sm:flex-row gap-4">
        <a href="{{ route('member.profile.edit') }}" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-komuna-blue text-white rounded-xl font-medium hover:bg-komuna-blue/90 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Lengkapi Profil
        </a>
        <a href="#" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-komuna-teal text-white rounded-xl font-medium hover:bg-komuna-teal/90 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            Pilih Interest
        </a>
        <a href="{{ route('communities.directory') }}" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-komuna-navy text-white rounded-xl font-medium hover:bg-komuna-navy/90 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Jelajahi Komunitas
        </a>
    </div>
</div>
@endsection
