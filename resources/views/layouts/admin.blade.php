<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $pageTitle ?? 'Admin' }} - {{ config('app.name', 'KomunaID') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="min-h-screen flex">
        {{-- Sidebar --}}
        <aside id="sidebar" class="w-64 bg-gradient-to-b from-komuna-navy to-[#061E52] text-white flex-shrink-0 hidden lg:flex flex-col fixed h-full z-30">
            <div class="p-5 border-b border-white/10">
                <a href="{{ route('superadmin.dashboard') }}" class="text-xl font-bold">Komuna<span class="text-komuna-cyan">ID</span></a>
                <div class="text-xs text-blue-300 mt-1">Admin Panel</div>
            </div>
            <nav class="flex-1 py-4 overflow-y-auto">
                <div class="px-4 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Manajemen</div>
                <a href="{{ route('superadmin.dashboard') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.dashboard') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Dashboard
                </a>
                <a href="{{ route('superadmin.approval-center.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.approval-center.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Approval Center
                </a>
                <a href="{{ route('superadmin.users.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.users.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    Users
                </a>
                <a href="{{ route('superadmin.communities.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.communities.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Communities
                </a>
                <a href="{{ route('superadmin.brands.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.brands.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" strokecurrentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    Brands
                </a>
                <a href="{{ route('superadmin.categories.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.categories.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    Categories
                </a>
                <a href="{{ route('superadmin.regions.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.regions.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Regions
                </a>
                <div class="px-4 mt-6 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Keuangan</div>
                <a href="{{ route('superadmin.wallets.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.wallets.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Wallets
                </a>
                <a href="{{ route('superadmin.donations.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.donations.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    Donations
                </a>
                <a href="{{ route('superadmin.platform-fees.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.platform-fees.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    Platform Fees
                </a>
                <div class="px-4 mt-6 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Sistem</div>
                <a href="{{ route('superadmin.audit-logs.index') }}"
                   class="flex items-center gap-3 px-5 py-2.5 text-sm {{ request()->routeIs('superadmin.audit-logs.*') ? 'bg-komuna-blue text-white' : 'text-blue-100 hover:bg-white/10' }} transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    Audit Logs
                </a>
                <div class="px-4 mt-6 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Akses</div>
                <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Website
                </a>
                <form method="POST" action="{{ route('admin.logout') }}">
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
            <a href="{{ route('superadmin.dashboard') }}" class="text-lg font-bold">Komuna<span class="text-komuna-cyan">ID</span> Admin</a>
            <button onclick="document.getElementById('mobile-sidebar').classList.toggle('hidden')" class="text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>

        {{-- Mobile sidebar overlay --}}
        <div id="mobile-sidebar" class="hidden fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/50" onclick="document.getElementById('mobile-sidebar').classList.add('hidden')"></div>
            <div class="absolute left-0 top-0 bottom-0 w-64 bg-komuna-navy text-white">
                <div class="p-5 border-b border-white/10 flex items-center justify-between">
                    <a href="{{ route('superadmin.dashboard') }}" class="text-lg font-bold">Komuna<span class="text-komuna-cyan">ID</span></a>
                    <button onclick="document.getElementById('mobile-sidebar').classList.add('hidden')" class="text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <nav class="py-4">
                    <a href="{{ route('superadmin.dashboard') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Dashboard</a>
                    <a href="{{ route('superadmin.users.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Users</a>
                    <a href="{{ route('superadmin.communities.index') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Communities</a>
                    <a href="{{ route('home') }}" class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Website</a>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" class="w-full text-left flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition">Logout</button>
                    </form>
                </nav>
            </div>
        </div>

        {{-- Main content --}}
        <div class="flex-1 lg:ml-64">
            <div class="bg-white border-b border-gray-200 px-6 py-4 hidden lg:flex items-center justify-between">
                <h1 class="text-lg font-bold text-komuna-navy">{{ $pageTitle ?? 'Admin Dashboard' }}</h1>
                <div class="flex items-center gap-3">
                    <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Superadmin</span>
                    <span class="text-sm text-gray-600">{{ auth()->user()->name }}</span>
                    <div class="w-8 h-8 bg-komuna-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {{ substr(auth()->user()->name, 0, 1) }}
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
                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
