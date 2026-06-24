<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $pageTitle ?? config('app.name', 'KomunaID') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    @include('partials.navbar')

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

    <footer class="bg-komuna-navy text-white mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-4 md:mb-0">
                    <span class="text-xl font-bold">Komuna<span class="text-komuna-cyan">ID</span></span>
                    <p class="text-blue-200 text-sm mt-1">Connect. Collaborate. Community.</p>
                </div>
                <div class="text-blue-200 text-sm">&copy; {{ date('Y') }} KomunaID. All rights reserved.</div>
            </div>
        </div>
    </footer>
</body>
</html>
