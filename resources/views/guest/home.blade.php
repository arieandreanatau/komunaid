@extends('layouts.public')

@section('content')
<section class="komuna-gradient-hero text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div class="text-center">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                Komuna<span class="text-komuna-cyan">ID</span>
            </h1>
            <p class="text-xl sm:text-2xl text-blue-200 mb-4 font-light">Connect. Collaborate. Community.</p>
            <p class="text-base sm:text-lg text-blue-300 mb-10 max-w-2xl mx-auto">
                Temukan komunitas yang sesuai minatmu, terhubung dengan orang-orang sejiwa, dan bangun kolaborasi yang bermakna.
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <a href="{{ route('communities.directory') }}" class="bg-white text-komuna-navy px-8 py-3 rounded-xl text-lg font-semibold hover:bg-komuna-light transition shadow-lg">
                    Jelajahi Komunitas
                </a>
                @guest
                    <a href="{{ route('register') }}" class="border-2 border-white text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/10 transition">
                        Daftar Sekarang
                    </a>
                @else
                    <a href="{{ auth()->user()->getDashboardRoute() }}" class="border-2 border-white text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/10 transition">
                        Dashboard
                    </a>
                @endguest
            </div>
        </div>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-komuna-text mb-3">Kenapa KomunaID?</h2>
        <p class="text-komuna-muted max-w-xl mx-auto">Platform komunitas Indonesia yang menghubungkan minat, bakat, dan passion Anda.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-komuna-border-soft text-center hover:shadow-md transition">
            <div class="w-16 h-16 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-komuna-text mb-2">Temukan Komunitas</h3>
            <p class="text-komuna-muted text-sm">Jelajahi ratusan komunitas berdasarkan minat, kategori, dan lokasi Anda.</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-komuna-border-soft text-center hover:shadow-md transition">
            <div class="w-16 h-16 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-komuna-text mb-2">Bergabung & Terhubung</h3>
            <p class="text-komuna-muted text-sm">Join komunitas, ikuti event, dan jalin relasi dengan anggota lainnya.</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-komuna-border-soft text-center hover:shadow-md transition">
            <div class="w-16 h-16 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-komuna-text mb-2">Berkembang Bersama</h3>
            <p class="text-komuna-muted text-sm">Belajar, berkolaborasi, dan tumbuh bersama komunitas yang suportif.</p>
        </div>
    </div>
</section>

<section class="bg-komuna-light py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-komuna-navy mb-4">Siap Bergabung?</h2>
        <p class="text-komuna-muted mb-8 max-w-lg mx-auto">Mulai jelajahi komunitas sekarang dan temukan tempat yang tepat untuk Anda.</p>
        <a href="{{ route('communities.directory') }}" class="inline-block bg-komuna-blue text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-komuna-navy transition shadow">
            Lihat Semua Komunitas
        </a>
    </div>
</section>
@endsection
