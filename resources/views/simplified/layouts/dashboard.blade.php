<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard - KomunaID')</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .komuna-gradient { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); }
        .sidebar-link.active { background: rgba(99,102,241,.12); color: #6366f1; font-weight: 600; }
        .sidebar-link { display: flex; align-items: center; padding: .625rem .875rem; border-radius: .5rem; color: #4b5563; }
        .sidebar-link:hover { background: #f3f4f6; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex min-h-screen">
        <aside class="w-64 bg-white border-r border-gray-200 p-4">
            <div class="komuna-gradient text-white rounded-xl p-4 mb-6">
                <h1 class="text-lg font-bold">KomunaID</h1>
                <p class="text-xs opacity-90">Simplified Flow v2</p>
            </div>
            <nav class="space-y-1 text-sm">
                <a href="{{ route('simplified.dashboard') }}" class="sidebar-link {{ request()->routeIs('simplified.dashboard') ? 'active' : '' }}">🏠 Dashboard</a>
                <a href="{{ route('simplified.submissions.index') }}" class="sidebar-link {{ request()->routeIs('simplified.submissions.*') ? 'active' : '' }}">📋 Pengajuan Saya</a>
                <a href="{{ route('simplified.apply.community.create') }}" class="sidebar-link">🤝 Ajukan Komunitas</a>
                <a href="{{ route('simplified.apply.brand.create') }}" class="sidebar-link">🏷️ Ajukan Brand</a>
                <a href="{{ route('simplified.apply.company.create') }}" class="sidebar-link">🏢 Ajukan Perusahaan</a>
                @if(auth()->user() && (auth()->user()->hasRole('superadmin') || auth()->user()->hasRole('admin_platform')))
                    <hr class="my-3">
                    <a href="{{ route('simplified.admin.approvals.index') }}" class="sidebar-link">🛡️ Admin Panel</a>
                @endif
            </nav>
            <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="text-xs text-gray-500 mb-2">{{ auth()->user()->name ?? 'Guest' }}</div>
                <form method="POST" action="{{ route('simplified.logout') }}">
                    @csrf
                    <button type="submit" class="w-full text-left sidebar-link text-red-600">🚪 Logout</button>
                </form>
            </div>
        </aside>
        <main class="flex-1 p-8">
            @if(session('success'))
                <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">{{ session('success') }}</div>
            @endif
            @if(session('warning'))
                <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">{{ session('warning') }}</div>
            @endif
            @if(session('error'))
                <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">{{ session('error') }}</div>
            @endif
            @yield('content')
        </main>
    </div>
</body>
</html>
