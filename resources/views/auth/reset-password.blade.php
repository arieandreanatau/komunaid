@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-komuna-text">Reset Password</h2>
    </div>

    <form method="POST" action="{{ route('password.store') }}">
        @csrf
        <input type="hidden" name="token" value="{{ $request->route('token') }}">
        <div class="space-y-4">
            <div>
                <label for="email" class="block text-sm font-medium text-komuna-text">Email</label>
                <input type="email" name="email" id="email" value="{{ old('email', $request->email) }}" required
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5">
                @error('email')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>
            <div>
                <label for="password" class="block text-sm font-medium text-komuna-text">Password Baru</label>
                <input type="password" name="password" id="password" required
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5">
                @error('password')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>
            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-komuna-text">Konfirmasi Password</label>
                <input type="password" name="password_confirmation" id="password_confirmation" required
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5">
            </div>
            <button type="submit" class="w-full bg-komuna-blue text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
                Reset Password
            </button>
        </div>
    </form>
</div>
@endsection
