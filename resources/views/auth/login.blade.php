@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-xl shadow-lg p-8">
    <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Login</h2>
        <p class="text-gray-600 mt-1">Masuk ke KomunaID</p>
    </div>

    @if(session('status'))
        <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            {{ session('status') }}
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}">
        @csrf
        <div class="space-y-4">
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus
                    class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border px-3 py-2">
                @error('email')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" id="password" required
                    class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border px-3 py-2">
                @error('password')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex items-center">
                <input type="checkbox" name="remember" id="remember" class="rounded border-gray-300 text-indigo-600">
                <label for="remember" class="ml-2 text-sm text-gray-600">Ingat saya</label>
            </div>

            <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">
                Login
            </button>
        </div>
    </form>

    <div class="mt-6 text-center">
        <a href="{{ route('password.request') }}" class="text-sm text-indigo-600 hover:text-indigo-800">Lupa password?</a>
        <br>
        <a href="{{ route('register') }}" class="text-sm text-indigo-600 hover:text-indigo-800">Belum punya akun? Daftar</a>
    </div>
</div>
@endsection
