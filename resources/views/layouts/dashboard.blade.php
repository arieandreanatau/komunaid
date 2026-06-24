<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $pageTitle ?? config('app.name', 'KomunaID') }} - Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="min-h-screen flex">
        {{-- Sidebar --}}
        <aside id="sidebar" class="w-64 bg-komuna-navy text-white flex-shrink-0 hidden lg:flex flex-col fixed h-full z-30">
            <div class="p-5 border-b border-white/10">
                <a href="{{ route('home') }}" class="text-xl font-bold">Komuna<span class="text-komuna-cyan">ID</span></a>
            </div>
            <nav class="flex-1 py-4 overflow-y-auto">
                <div class="px-4 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Menu Utama</div>
                @php
                    $role = auth()->user()->getRoleNames()->first() ?? 'member';
                    $prefix = match($role) {
                        'community_owner' => 'community',
                        'brand_owner' => 'brand',
                        default => 'member',
                    };
                @endphp
                <a href="{{ route($prefix . '.dashboard') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs($prefix . '.dashboard') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Dashboard
                </a>
                @if($role === 'member')
                    <a href="{{ route('member.profile.edit') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.profile.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        Profile
                    </a>
                    <a href="{{ route('member.role-request.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.role-request.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Role Request
                    </a>
                    <a href="{{ route('member.wallet.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('member.wallet.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Wallet
                    </a>
                @elseif($role === 'community_owner')
                    <a href="{{ route('community.communities.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.communities.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Komunitas
                    </a>
                    <a href="{{ route('community.events.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.events.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Events
                    </a>
                    <a href="{{ route('community.wallet.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.wallet.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Wallet
                    </a>
                    <a href="{{ route('community.collaborations.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('community.collaborations.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                        Kolaborasi
                    </a>
                @elseif($role === 'brand_owner' || $role === 'brand_staff')
                    <a href="{{ route('brand.brands.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.brands.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                        Brand
                    </a>
                    <a href="{{ route('brand.campaigns.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.campaigns.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                        Campaigns
                    </a>
                    <a href="{{ route('brand.collaborations.index') }}"
                       class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('brand.collaborations.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                        Kolaborasi
                    </a>
                @endif
                <div class="px-4 mt-6 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Akses</div>
                <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Website
                </a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Logout
                    </button>
                </form>
            </nav>
        </aside>

        {{-- Mobile top bar --}}
        <div class="lg:hidden fixed top-0 left-0 right-0 bg-komuna-navy text-white z-40 px-4 py-3 flex items-center justify-between">
            <a href="{{ route('home') }}" class="text-lg font-bold">Komuna<span class="text-komuna-cyan">ID</span></a>
            <button onclick="document.getElementById('mobile-sidebar').classList.toggle('hidden')" class="text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>

        {{-- Mobile sidebar overlay --}}
        <div id="mobile-sidebar" class="hidden fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/50" onclick="document.getElementById('mobile-sidebar').classList.add('hidden')"></div>
            <div class="absolute left-0 top-0 bottom-0 w-64 bg-komuna-navy text-white">
                <div class="p-5 border-b border-white/10 flex items-center justify-between">
                    <a href="{{ route('home') }}" class="text-xl font-bold">Komuna<span class="text-komuna-cyan">ID</span></a>
                    <button onclick="document.getElementById('mobile-sidebar').classList.add('hidden')" class="text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <nav class="py-4">
                    <a href="{{ route($prefix . '.dashboard') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Dashboard</a>
                    <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Website</a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="w-full text-left flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Logout</button>
                    </form>
                </nav>
            </div>
        </div>

        {{-- Main content --}}
        <div class="flex-1 lg:ml-64">
            <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:block hidden">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-lg font-bold text-komuna-navy">{{ $pageTitle ?? 'Dashboard' }}</h1>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-gray-600">{{ auth()->user()->name }}</span>
                        <div class="w-8 h-8 bg-komuna-cyan rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {{ substr(auth()->user()->name, 0, 1) }}
                        </div>
                    </div>
                </div>
            </div>

            <main class="p-6">
                @if(session('success'))
                    <div class="mb-4 bg-komuna-soft/40 border border-komuna-cyan text-komuna-navy px-4 py-3 rounded-xl text-sm">
                        {{ session('success') }}
                    </div>
                @endif
                @if(session('error'))
                    <div class="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {{ session('error') }}
                    </div>
                @endif
                @if(session('warning'))
                    <div class="mb-4 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl text-sm">
                        {{ session('warning') }}
                    </div>
                @endif
                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
