@extends('simplified.layouts.guest')
@section('title', 'Buat Akun KomunaID')
@section('content')
<div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-6">
            <div class="komuna-gradient text-white inline-block px-4 py-2 rounded-lg font-bold text-xl mb-2">KomunaID</div>
            <h1 class="text-2xl font-bold text-gray-900">Buat Akun KomunaID</h1>
            <p class="text-sm text-gray-600 mt-1">Daftar sekali untuk mengakses komunitas, event, brand, dan peluang kolaborasi.</p>
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

            <form method="POST" action="{{ route('simplified.register') }}" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input type="text" name="name" value="{{ old('name') }}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" name="username" value="{{ old('username') }}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value="{{ old('email') }}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">No. HP (opsional)</label>
                    <input type="text" name="phone" value="{{ old('phone') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                    <input type="password" name="password_confirmation" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                <label class="flex items-start gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="agree_terms" value="1" {{ old('agree_terms') ? 'checked' : '' }} class="mt-1">
                    <span>Saya menyetujui <a href="#" class="text-indigo-600">Syarat & Ketentuan</a> dan <a href="#" class="text-indigo-600">Kebijakan Privasi</a> KomunaID.</span>
                </label>

                <button type="submit" class="w-full komuna-gradient text-white font-semibold py-2.5 rounded-lg hover:opacity-95">Daftar Sekarang</button>
            </form>

            <p class="text-xs text-gray-500 text-center mt-4">Setelah membuat akun, kamu bisa mengajukan Komunitas, Brand, atau Perusahaan dari dashboard.</p>

            <p class="text-sm text-center mt-4 text-gray-700">
                Sudah punya akun? <a href="{{ route('simplified.login') }}" class="text-indigo-600 font-medium">Masuk</a>
            </p>
        </div>
    </div>
</div>
@endsection
