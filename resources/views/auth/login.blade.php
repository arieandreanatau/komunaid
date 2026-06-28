@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-komuna-text">Masuk</h2>
        <p class="text-komuna-muted mt-1">Selamat datang kembali di KomunaID</p>
    </div>

    @if(session('status'))
        <div class="mb-4">
            <x-alert type="info" :message="session('status')" />
        </div>
    @endif

    @if($errors->any())
        <div class="mb-4">
            <x-alert type="error" :message="$errors->first()" />
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}">
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
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="Masukkan password">
                @error('password')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex items-center">
                <input type="checkbox" name="remember" id="remember" {{ old('remember') ? 'checked' : '' }}
                    class="rounded border-komuna-border text-komuna-blue focus:ring-komuna-blue">
                <label for="remember" class="ml-2 text-sm text-komuna-muted">Ingat saya</label>
            </div>

            <button type="submit" class="w-full bg-komuna-blue text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
                Masuk
            </button>
        </div>
    </form>

    <div class="mt-6 text-center space-y-2">
        <a href="{{ route('password.request') }}" class="text-sm text-komuna-muted hover:text-komuna-blue">Lupa password?</a>
        <br>
        <a href="{{ route('register') }}" class="text-sm text-komuna-blue hover:text-komuna-navy font-medium">Belum punya akun? Daftar</a>
    </div>

    <div class="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
        <a href="{{ route('admin.login') }}" class="inline-flex items-center gap-2 text-xs text-[#64748B] hover:text-[#0B2D89] transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Login Superadmin
        </a>
    </div>
</div>
@endsection
