@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-6">
        <div class="w-16 h-16 bg-komuna-danger-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-komuna-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
        </div>
        <h2 class="text-2xl font-bold text-komuna-text">Akun Dibatasi</h2>
        <p class="text-komuna-muted mt-2">Akun Anda sedang dalam pembatasan akses.</p>
    </div>

    <div class="bg-komuna-danger-soft border border-komuna-danger/20 rounded-xl p-4 mb-6">
        <p class="text-sm text-komuna-danger text-center">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi tim support KomunaID untuk bantuan lebih lanjut.
        </p>
    </div>

    <div class="space-y-3">
        <a href="{{ route('login') }}" class="block text-center bg-komuna-blue text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
            Kembali ke Login
        </a>
        <a href="{{ route('home') }}" class="block text-center bg-komuna-border-soft text-komuna-text py-2.5 rounded-xl font-semibold hover:bg-komuna-border transition">
            Kembali ke Beranda
        </a>
    </div>
</div>
@endsection
