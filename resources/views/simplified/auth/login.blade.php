@extends('simplified.layouts.guest')
@section('title', 'Masuk ke KomunaID')
@section('content')
<div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-6">
            <div class="komuna-gradient text-white inline-block px-4 py-2 rounded-lg font-bold text-xl mb-2">KomunaID</div>
            <h1 class="text-2xl font-bold text-gray-900">Masuk ke KomunaID</h1>
            <p class="text-sm text-gray-600 mt-1">Gunakan satu akun untuk mengakses semua peranmu di KomunaID.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
            @if($errors->any())
                <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                    <ul class="list-disc pl-4">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('simplified.login') }}" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email atau Username</label>
                    <input type="text" name="login" value="{{ old('login') }}" required autofocus class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" name="remember" value="1"> Remember me
                    </label>
                    <a href="{{ route('password.request') }}" class="text-indigo-600">Lupa password?</a>
                </div>
                <button type="submit" class="w-full komuna-gradient text-white font-semibold py-2.5 rounded-lg hover:opacity-95">Masuk</button>
            </form>

            <p class="text-sm text-center mt-4 text-gray-700">
                Belum punya akun? <a href="{{ route('simplified.register') }}" class="text-indigo-600 font-medium">Daftar</a>
            </p>
        </div>
    </div>
</div>
@endsection
