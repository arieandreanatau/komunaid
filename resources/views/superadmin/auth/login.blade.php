<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin Login - {{ config('app.name', 'KomunaID') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-komuna-navy min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md px-4">
        <div class="text-center mb-8">
            <a href="{{ route('home') }}" class="inline-block">
                <x-logo size="xl" :dark="true" />
            </a>
            <p class="text-blue-300 mt-2 text-sm">Superadmin Panel</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-6">
                <div class="w-14 h-14 bg-komuna-light rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-7 h-7 text-komuna-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-komuna-text">Admin Login</h2>
                <p class="text-komuna-muted mt-1 text-sm">Akses internal superadmin</p>
            </div>

            @if(session('status'))
                <div class="mb-4">
                    <x-alert type="info" :message="session('status')" />
                </div>
            @endif

            <form method="POST" action="{{ route('admin.login.submit') }}">
                @csrf
                <div class="space-y-4">
                    <div>
                        <label for="login" class="block text-sm font-medium text-komuna-text">Email atau Username</label>
                        <input type="text" name="login" id="login" value="{{ old('login') }}" required autofocus
                            class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                            placeholder="Email atau username">
                        @error('login')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-komuna-text">Password</label>
                        <input type="password" name="password" id="password" required
                            class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5">
                        @error('password')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="remember" id="remember" class="rounded border-komuna-border text-komuna-blue focus:ring-komuna-blue">
                        <label for="remember" class="ml-2 text-sm text-komuna-muted">Ingat saya</label>
                    </div>

                    <button type="submit" class="w-full bg-komuna-navy text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy-dark transition">
                        Login
                    </button>
                </div>
            </form>

            <div class="mt-6 text-center">
                <a href="{{ route('login') }}" class="text-sm text-komuna-blue hover:text-komuna-navy transition">Login sebagai user</a>
                <span class="text-komuna-border mx-2">|</span>
                <a href="{{ route('home') }}" class="text-sm text-komuna-muted hover:text-komuna-text transition">Kembali ke website</a>
            </div>
        </div>
    </div>
</body>
</html>
