@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-komuna-text">Buat Akun KomunaID</h2>
        <p class="text-komuna-muted mt-1">Gabung dan temukan komunitas yang sesuai dengan minatmu.</p>
    </div>

    @if(session('error'))
        <div class="mb-4">
            <x-alert type="error" :message="session('error')" />
        </div>
    @endif

    @if($errors->any())
        <div class="mb-4">
            <x-alert type="error" :message="$errors->first()" />
        </div>
    @endif

    <form method="POST" action="{{ route('register') }}">
        @csrf
        <div class="space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-komuna-text">Nama Tampilan <span class="text-komuna-muted">(opsional)</span></label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" autofocus
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="Nama kamu">
                @error('name')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="username" class="block text-sm font-medium text-komuna-text">Username <span class="text-komuna-muted">(opsional)</span></label>
                <input type="text" name="username" id="username" value="{{ old('username') }}"
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="username_unik">
                @error('username')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-komuna-text">Email <span class="text-komuna-muted">(opsional)</span></label>
                <input type="email" name="email" id="email" value="{{ old('email') }}"
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="nama@email.com">
                @error('email')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>

            <div class="text-xs text-komuna-muted bg-komuna-light px-3 py-2 rounded-lg">
                Isi email atau username, minimal salah satu.
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-komuna-text">Password</label>
                <input type="password" name="password" id="password" required
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="Minimal 8 karakter">
                @error('password')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-komuna-text">Konfirmasi Password</label>
                <input type="password" name="password_confirmation" id="password_confirmation" required
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="Ulangi password">
            </div>

            <button type="submit" class="w-full bg-komuna-blue text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
                Daftar
            </button>
        </div>
    </form>

    <div class="mt-6 text-center">
        <a href="{{ route('login') }}" class="text-sm text-komuna-blue hover:text-komuna-navy font-medium">Sudah punya akun? Masuk</a>
    </div>
</div>
@endsection
