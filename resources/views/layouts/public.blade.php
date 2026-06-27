<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name', 'KomunaID'))</title>
    @yield('meta_description')
    <link rel="icon" type="image/png" href="{{ asset('assets/brand/komunaid-logo-full.png') }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-komuna-surface min-h-screen">
    @include('public.partials.navbar')

    <main>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            @if(session('success'))
                <x-alert type="success" :message="session('success')" />
            @endif
            @if(session('error'))
                <x-alert type="error" :message="session('error')" />
            @endif
            @if(session('warning'))
                <x-alert type="warning" :message="session('warning')" />
            @endif
            @if(session('info'))
                <x-alert type="info" :message="session('info')" />
            @endif
        </div>
        @yield('content')
    </main>

    @include('public.partials.footer')
</body>
</html>
