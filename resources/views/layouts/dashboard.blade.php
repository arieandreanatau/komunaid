<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $pageTitle ?? config('app.name', 'KomunaID') }} - Dashboard</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/brand/komunaid-logo-full.png') }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-komuna-surface min-h-screen">
    @php
        $activeBg = $activeBg ?? 'bg-komuna-green text-white';
        $sidebarActive = $sidebarActive ?? 'bg-white/10 text-white';
        $sidebarHover = $sidebarHover ?? 'text-blue-100 hover:bg-white/5';
    @endphp
    <div class="min-h-screen flex">
                @php
                    $role = auth()->user()->getRoleNames()->first() ?? 'member';
                    $prefix = match($role) {
                        'community_owner' => 'community',
                        'brand_owner' => 'brand',
                        'company_owner' => 'company-owner',
                        default => 'member',
                    };
                @endphp

        {{-- Desktop Sidebar --}}
        <aside id="sidebar" class="w-64 {{ $sidebarBg ?? 'bg-komuna-navy' }} text-white flex-shrink-0 hidden lg:flex flex-col fixed h-full z-30 overflow-y-auto">
            <div class="p-5 border-b border-white/10">
                <a href="{{ route('home') }}" class="flex items-center gap-2">
                    @include('partials.logo', ['size' => 'sm', 'dark' => true])
                </a>
                <div class="text-xs text-komuna-cyan/70 mt-1 font-medium">{{ $roleLabel ?? 'Member' }}</div>
            </div>
            <nav class="flex-1 py-3">
                <div class="px-4 mb-1 text-[10px] font-semibold text-blue-300/60 uppercase tracking-wider">Menu Utama</div>
                <a href="{{ route($prefix . '.dashboard') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs($prefix . '.dashboard') ? $activeBg : 'text-blue-100 hover:bg-white/5' }} transition border-r-3 border-transparent">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Dashboard
                </a>

                @if($role === 'member')
                    <a href="{{ route('member.profile.edit') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.profile.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        Profil Saya
                    </a>
                    <a href="#"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.interests.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                        Interest
                    </a>
                    <a href="{{ route('communities.directory') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.communities.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Komunitas Saya
                    </a>
                    <a href="{{ route('events.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.events.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Event Saya
                    </a>
                    <a href="{{ route('member.event-volunteer-applications.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.event-volunteer-applications.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        Volunteer Saya
                    </a>
                    <a href="{{ route('member.donations.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.donations.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Donasi Saya
                    </a>
                    <a href="{{ route('member.friends.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.friends.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                        Teman
                    </a>
                    <a href="{{ route('member.bookmarks.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.bookmarks.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                        Bookmark
                    </a>
                    <a href="{{ route('member.galleries.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.galleries.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Galeri
                    </a>
                    <a href="#"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.history.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        History
                    </a>
                    <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-komuna-muted uppercase tracking-wider">Lainnya</div>
                    <a href="{{ route('member.role-requests.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.role-requests.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Request Role
                    </a>
                    <a href="{{ route('member.wallet.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.wallet.*') ? $sidebarActive : $sidebarHover }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Wallet
                    </a>
                @elseif($role === 'community_owner')
                    <a href="{{ route('community.communities.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.communities.*') ? $activeBg : 'text-blue-100 hover:bg-white/5' }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Komunitas
                    </a>
                    <a href="{{ route('community.events.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.events.*') ? $activeBg : 'text-blue-100 hover:bg-white/5' }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Events
                    </a>
                    @if(request()->routeIs('community.events.*') && !request()->routeIs('community.events.index') && !request()->routeIs('community.events.create'))
                        <div class="ml-8 space-y-1 border-l border-white/10 pl-3 mb-2">
                            @if(isset($event))
                                <a href="{{ route('community.events.participants.index', $event) }}" class="block px-3 py-1.5 text-xs {{ request()->routeIs('community.events.participants.*') ? 'text-white font-medium' : 'text-blue-200 hover:text-white' }} transition">Peserta</a>
                                <a href="{{ route('community.events.volunteer-campaign.show', $event) }}" class="block px-3 py-1.5 text-xs {{ request()->routeIs('community.events.volunteer-campaign.*') || request()->routeIs('community.events.volunteer-applications.*') ? 'text-white font-medium' : 'text-blue-200 hover:text-white' }} transition">Volunteer</a>
                                <a href="{{ route('community.events.volunteers.index', $event) }}" class="block px-3 py-1.5 text-xs {{ request()->routeIs('community.events.volunteers.*') ? 'text-white font-medium' : 'text-blue-200 hover:text-white' }} transition">Relawan</a>
                                <a href="{{ route('community.events.donations.index', $event) }}" class="block px-3 py-1.5 text-xs {{ request()->routeIs('community.events.donations.*') ? 'text-white font-medium' : 'text-blue-200 hover:text-white' }} transition">Donasi</a>
                                <a href="{{ route('community.events.finance.index', $event) }}" class="block px-3 py-1.5 text-xs {{ request()->routeIs('community.events.finance.*') ? 'text-white font-medium' : 'text-blue-200 hover:text-white' }} transition">Keuangan</a>
                            @endif
                        </div>
                    @endif
                    <a href="{{ route('community.wallet.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.wallet.*') ? $activeBg : 'text-blue-100 hover:bg-white/5' }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Wallet
                    </a>
                    <a href="{{ route('community.collaborations.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.collaborations.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                        Kolaborasi
                    </a>
                    <a href="{{ route('community.proposals.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.proposals.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Proposal Masuk
                    </a>
                @elseif($role === 'brand_owner' || $role === 'brand_staff')
                    <a href="{{ route('brand.brands.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.brands.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                        Brand
                    </a>
                    <a href="{{ route('brand.campaigns.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.campaigns.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                        Campaigns
                    </a>
                    <a href="{{ route('brand.proposals.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.proposals.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Proposal
                    </a>
                    <a href="{{ route('brand.community-directory.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.community-directory.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Komunitas
                    </a>
                    <a href="{{ route('brand.settings.profile') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.settings.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Settings
                    </a>
                @elseif($role === 'company_owner')
                    <a href="{{ route('company-owner.dashboard') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('company-owner.dashboard') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        Dashboard
                    </a>
                    <a href="{{ route('company-owner.companies.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('company-owner.companies.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        Perusahaan
                    </a>
                    <a href="{{ route('company-owner.collaborations.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('company-owner.collaborations.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Kolaborasi
                    </a>
                    <a href="{{ route('company-owner.settings.profile') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('company-owner.settings.*') ? 'bg-komuna-green text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Settings
                    </a>
                    <a href="{{ route('brand.campaigns.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.campaigns.*') ? $activeBg : 'text-blue-100 hover:bg-white/5' }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                        Campaigns
                    </a>
                    <a href="{{ route('brand.collaborations.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.collaborations.*') ? $activeBg : 'text-blue-100 hover:bg-white/5' }} transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                        Kolaborasi
                    </a>
                @endif

                <div class="px-4 mt-6 mb-1 text-[10px] font-semibold text-blue-300/60 uppercase tracking-wider">Akses</div>
                <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/5 transition border-r-3 border-transparent">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Website
                </a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/5 transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Logout
                    </button>
                </form>
            </nav>
        </aside>

        {{-- Mobile top bar --}}
        <div class="lg:hidden fixed top-0 left-0 right-0 bg-komuna-navy text-white z-40 px-4 py-3 flex items-center justify-between">
            <a href="{{ route('home') }}" class="flex items-center gap-2">
                @include('partials.logo', ['size' => 'sm', 'dark' => true])
            </a>
            <button onclick="document.getElementById('mobile-sidebar').classList.toggle('hidden')" class="text-white" aria-label="Toggle sidebar">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>

        {{-- Mobile sidebar overlay --}}
        <div id="mobile-sidebar" class="hidden fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/50" onclick="document.getElementById('mobile-sidebar').classList.add('hidden')"></div>
            <div class="absolute left-0 top-0 bottom-0 w-64 {{ $sidebarBg ?? 'bg-komuna-navy' }} text-white overflow-y-auto">
                <div class="p-5 border-b border-white/10 flex items-center justify-between">
                    <a href="{{ route('home') }}" class="flex items-center gap-2">
                        @include('partials.logo', ['size' => 'sm', 'dark' => true])
                    </a>
                    <button onclick="document.getElementById('mobile-sidebar').classList.add('hidden')" class="text-white" aria-label="Close sidebar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <nav class="py-3">
                    <a href="{{ route($prefix . '.dashboard') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Dashboard</a>
                    @if($role === 'member')
                        <a href="{{ route('member.profile.edit') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Profil Saya</a>
                        <a href="#" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Interest</a>
                        <a href="{{ route('communities.directory') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Komunitas Saya</a>
                        <a href="{{ route('events.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Event Saya</a>
                        <a href="{{ route('member.friends.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Teman</a>
                        <a href="{{ route('member.bookmarks.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Bookmark</a>
                        <a href="{{ route('member.galleries.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Galeri</a>
                        <a href="#" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">History</a>
                        <a href="{{ route('member.role-requests.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Request Role</a>
                        <a href="{{ route('member.wallet.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Wallet</a>
                    @endif
                    <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Website</a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="w-full text-left flex items-center gap-3 px-5 py-2.5 text-sm {{ $sidebarHover }} transition">Logout</button>
                    </form>
                </nav>
            </div>
        </div>

        {{-- Main content --}}
        <div class="flex-1 lg:ml-64">
            {{-- Topbar --}}
            <div class="bg-white border-b border-komuna-border px-6 py-3 hidden lg:flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-2 text-sm text-komuna-muted">
                    @isset($breadcrumb)
                        {!! $breadcrumb !!}
                    @else
                        <span>{{ $pageTitle ?? 'Dashboard' }}</span>
                    @endisset
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs bg-komuna-blue/10 text-komuna-blue px-2.5 py-1 rounded-full font-semibold">{{ $roleLabel ?? 'Member' }}</span>
                    <div class="w-8 h-8 bg-komuna-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {{ substr(auth()->user()->name, 0, 1) }}
                    </div>
                    <span class="text-sm text-komuna-text font-medium">{{ auth()->user()->name }}</span>
                </div>
            </div>

            {{-- Mobile topbar --}}
            <div class="lg:hidden bg-white border-b border-komuna-border px-4 py-3 mt-12 flex items-center justify-between">
                <h1 class="text-base font-bold text-komuna-navy">{{ $pageTitle ?? 'Dashboard' }}</h1>
                <div class="flex items-center gap-2">
                    <span class="text-xs bg-komuna-blue/10 text-komuna-blue px-2 py-0.5 rounded-full font-semibold">{{ $roleLabel ?? 'Member' }}</span>
                </div>
            </div>

            {{-- Content --}}
            <main class="p-6">
                @if(session('success'))
                    <x-alert type="success" :message="session('success')" />
                @endif
                @if(session('error'))
                    <x-alert type="error" :message="session('error')" />
                @endif
                @if(session('warning'))
                    <x-alert type="warning" :message="session('warning')" />
                @endif
                @if($errors->any())
                    <div class="mb-4 bg-komuna-danger-soft border border-komuna-danger text-komuna-danger px-4 py-3 rounded-xl text-sm">
                        <ul class="list-disc list-inside">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
