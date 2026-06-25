@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-komuna-text">Lupa Password</h2>
        <p class="text-komuna-muted mt-1">Masukkan email untuk reset password</p>
    </div>

    @if(session('status'))
        <div class="mb-4">
            <x-alert type="info" :message="session('status')" />
        </div>
    @endif

    <form method="POST" action="{{ route('password.email') }}">
        @csrf
        <div class="space-y-4">
            <div>
                <label for="email" class="block text-sm font-medium text-komuna-text">Email</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="nama@email.com">
                @error('email')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>

            <button type="submit" class="w-full bg-komuna-blue text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
                Kirim Link Reset
            </button>
        </div>
    </form>

    <div class="mt-6 text-center">
        <a href="{{ route('login') }}" class="text-sm text-komuna-blue hover:text-komuna-navy">Kembali ke Login</a>
    </div>
</div>
@endsection
