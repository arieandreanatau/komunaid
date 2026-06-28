<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $pageTitle ?? 'Admin' }} - {{ config('app.name', 'KomunaID') }}</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/brand/komunaid-logo-full.png') }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-komuna-surface min-h-screen">
    @php
        $saActive = 'bg-komuna-cyan/20 border-r-3 border-komuna-cyan text-komuna-cyan';
        $adminChatUnread = 0;
        try {
            if (auth()->check() && (auth()->user()->hasRole('superadmin') || auth()->user()->hasRole('platform_admin'))) {
                $adminChatUnread = app(\App\Services\AdminChatService::class)->unreadCountForUser(auth()->user());
            }
        } catch (\Exception $e) {
            $adminChatUnread = 0;
        }
    @endphp
    <div class="min-h-screen flex">
        {{-- Desktop Sidebar --}}
        <aside id="sidebar" class="w-64 bg-komuna-navy text-white flex-shrink-0 hidden lg:flex flex-col fixed h-full z-30 overflow-y-auto border-r border-white/5">
            <div class="p-5 border-b border-white/10">
                <a href="{{ route('superadmin.dashboard') }}">
                    @include('partials.logo', ['size' => 'sm', 'dark' => true])
                </a>
                <div class="text-xs text-komuna-cyan/70 mt-1">Superadmin Panel</div>
            </div>
            <nav class="flex-1 py-3">
                <div class="px-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Menu Utama</div>

                <a href="{{ route('superadmin.dashboard') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.dashboard') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Dashboard
                </a>
                <a href="{{ route('superadmin.members.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.members.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    Members
                </a>
                <a href="{{ route('superadmin.community-owners.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.community-owners.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Community Owners
                </a>
                <a href="{{ route('superadmin.brand-owners.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.brand-owners.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    Brand Owners
                </a>
                <a href="{{ route('superadmin.companies.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.companies.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    Companies
                </a>
                <a href="{{ route('superadmin.communities.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.communities.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Communities
                </a>
                <a href="{{ route('superadmin.events.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.events.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Events
                </a>
                <a href="{{ route('superadmin.approval-center.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.approval-center.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Approval Center
                </a>
                <a href="{{ route('superadmin.role-requests.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.role-requests.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                    Role Requests
                </a>

                <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Keuangan</div>
                <a href="{{ route('superadmin.wallets.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.wallets.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Wallets
                </a>
                <a href="{{ route('superadmin.donations.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.donations.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    Donations
                </a>
                <a href="{{ route('superadmin.platform-fees.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.platform-fees.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    Platform Fees
                </a>

                <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Logs</div>
                <a href="{{ route('superadmin.login-logs.today') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.login-logs.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Login Today
                </a>
                <a href="{{ route('superadmin.audit-logs.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.audit-logs.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    Audit Logs
                </a>

                <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Master Data</div>
                <a href="{{ route('superadmin.categories.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.categories.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    Categories
                </a>
                <a href="{{ route('superadmin.master-data.interests.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.master-data.interests*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    Interests
                </a>
                <a href="{{ route('superadmin.regions.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.regions.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Regions
                </a>
                <a href="{{ route('superadmin.master-data.event-types.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.master-data.event-types*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Event Types
                </a>

                <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">CMS</div>
                <a href="{{ route('superadmin.cms.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    CMS Beranda
                </a>
                <a href="{{ route('superadmin.cms.blogs.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.blogs.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                    Blog
                </a>
                <a href="{{ route('superadmin.cms.contact.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.contact.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Hubungi Kami
                </a>
                <a href="{{ route('superadmin.cms.suggestions.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.suggestions.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Suggestions
                </a>

                <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Lainnya</div>
                <a href="{{ route('superadmin.admin-chat.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.admin-chat.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition relative">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    Admin Chat
                    @if($adminChatUnread > 0)
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] bg-[#25B9F2] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {{ $adminChatUnread > 99 ? '99+' : $adminChatUnread }}
                        </span>
                    @endif
                </a>
                <a href="{{ route('superadmin.settings.profile') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.settings.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Settings
                </a>

                <div class="border-t border-white/10 mt-4 pt-3">
                    <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/5 transition border-r-3 border-transparent">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        Website
                    </a>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" class="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/5 transition border-r-3 border-transparent">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            Logout
                        </button>
                    </form>
                </div>
            </nav>
        </aside>

        {{-- Mobile top bar --}}
        <div class="lg:hidden fixed top-0 left-0 right-0 bg-komuna-navy text-white z-40 px-4 py-3 flex items-center justify-between border-b border-white/10">
            <a href="{{ route('superadmin.dashboard') }}">
                @include('partials.logo', ['size' => 'sm', 'dark' => true])
            </a>
            <button onclick="document.getElementById('mobile-sidebar').classList.toggle('hidden')" class="text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>

        {{-- Mobile sidebar overlay --}}
        <div id="mobile-sidebar" class="hidden fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/50" onclick="document.getElementById('mobile-sidebar').classList.add('hidden')"></div>
            <div class="absolute left-0 top-0 bottom-0 w-64 bg-komuna-navy text-white overflow-y-auto">
                <div class="p-5 border-b border-white/10 flex items-center justify-between">
                    <a href="{{ route('superadmin.dashboard') }}">
                        @include('partials.logo', ['size' => 'sm', 'dark' => true])
                    </a>
                    <button onclick="document.getElementById('mobile-sidebar').classList.add('hidden')" class="text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <nav class="py-3">
                    <div class="px-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Menu Utama</div>
                    <a href="{{ route('superadmin.dashboard') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.dashboard') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Dashboard</a>
                    <a href="{{ route('superadmin.members.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.members.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Members</a>
                    <a href="{{ route('superadmin.community-owners.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.community-owners.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Community Owners</a>
                    <a href="{{ route('superadmin.brand-owners.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.brand-owners.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Brand Owners</a>
                    <a href="{{ route('superadmin.companies.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.companies.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Companies</a>
                    <a href="{{ route('superadmin.communities.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.communities.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Communities</a>
                    <a href="{{ route('superadmin.events.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.events.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Events</a>
                    <a href="{{ route('superadmin.approval-center.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.approval-center.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Approval Center</a>
                    <a href="{{ route('superadmin.role-requests.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.role-requests.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Role Requests</a>

                    <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Keuangan</div>
                    <a href="{{ route('superadmin.wallets.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.wallets.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Wallets</a>
                    <a href="{{ route('superadmin.donations.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.donations.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Donations</a>
                    <a href="{{ route('superadmin.platform-fees.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.platform-fees.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Platform Fees</a>

                    <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Logs</div>
                    <a href="{{ route('superadmin.login-logs.today') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.login-logs.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Login Today</a>
                    <a href="{{ route('superadmin.audit-logs.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.audit-logs.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Audit Logs</a>

                    <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Master Data</div>
                    <a href="{{ route('superadmin.categories.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.categories.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Categories</a>
                    <a href="{{ route('superadmin.master-data.interests.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.master-data.interests*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Interests</a>
                    <a href="{{ route('superadmin.regions.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.regions.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Regions</a>
                    <a href="{{ route('superadmin.master-data.event-types.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.master-data.event-types*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Event Types</a>

                    <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">CMS</div>
                    <a href="{{ route('superadmin.cms.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">CMS Beranda</a>
                    <a href="{{ route('superadmin.cms.blogs.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.blogs.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Blog</a>
                    <a href="{{ route('superadmin.cms.contact.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.contact.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Hubungi Kami</a>
                    <a href="{{ route('superadmin.cms.suggestions.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.cms.suggestions.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Suggestions</a>

                <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Documentation</div>
                <a href="{{ route('superadmin.documentation.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.documentation.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Documentation
                </a>

                <div class="px-4 mt-4 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Lainnya</div>
                    <a href="{{ route('superadmin.admin-chat.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.admin-chat.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition relative">
                        Admin Chat
                        @if($adminChatUnread > 0)
                            <span class="min-w-[18px] h-[18px] bg-[#25B9F2] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                {{ $adminChatUnread > 99 ? '99+' : $adminChatUnread }}
                            </span>
                        @endif
                    </a>
                    <a href="{{ route('superadmin.settings.profile') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.settings.*') ? $saActive : 'text-blue-100 hover:bg-white/5 border-r-3 border-transparent' }} transition">Settings</a>

                    <div class="border-t border-white/10 mt-4 pt-3">
                        <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/5 transition border-r-3 border-transparent">Website</a>
                        <form method="POST" action="{{ route('admin.logout') }}">
                            @csrf
                            <button type="submit" class="w-full text-left flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/5 transition border-r-3 border-transparent">Logout</button>
                        </form>
                    </div>
                </nav>
            </div>
        </div>

        {{-- Main content --}}
        <div class="flex-1 lg:ml-64">
            {{-- Desktop Topbar --}}
            <div class="bg-white border-b border-komuna-border px-6 py-3 hidden lg:flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-komuna-muted">
                    @isset($breadcrumb)
                        {!! $breadcrumb !!}
                    @else
                        <span>{{ $pageTitle ?? 'Dashboard' }}</span>
                    @endisset
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs bg-komuna-light text-komuna-blue px-2.5 py-1 rounded-full font-semibold">Superadmin</span>
                    <div class="w-8 h-8 bg-komuna-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {{ substr(auth()->user()->name, 0, 1) }}
                    </div>
                    <span class="text-sm text-komuna-text font-medium">{{ auth()->user()->name }}</span>
                </div>
            </div>

            {{-- Content --}}
            <main class="p-4 sm:p-6">
                @if(session('success'))
                    <div class="mb-4">
                        <x-alert type="success" :message="session('success')" />
                    </div>
                @endif
                @if(session('error'))
                    <div class="mb-4">
                        <x-alert type="error" :message="session('error')" />
                    </div>
                @endif
                @if(session('warning'))
                    <div class="mb-4">
                        <x-alert type="warning" :message="session('warning')" />
                    </div>
                @endif
                @if(session('info'))
                    <div class="mb-4">
                        <x-alert type="info" :message="session('info')" />
                    </div>
                @endif
                @if($errors->any())
                    <div class="mb-4">
                        <div class="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium bg-komuna-danger-soft border-komuna-danger text-komuna-danger">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                            <ul class="list-disc list-inside">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                @endif
                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
