@extends('layouts.app')

@section('title', 'KomunaID - Connect. Collaborate. Grow.')

@section('content')
<section class="bg-navy text-white py-20">
    <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Connect. <span class="text-sky-blue">Collaborate.</span> Grow.
        </h1>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Platform pengelolaan komunitas terintegrasi. Hubungkan komunitas, brand, dan member dalam satu ekosistem.
        </p>
        <div class="flex justify-center gap-4">
            <a href="{{ route('public.communities') }}" class="bg-sky-blue hover:bg-blue text-white px-8 py-3 rounded-lg font-semibold transition">
                Jelajahi Komunitas
            </a>
            @guest
                <a href="{{ route('register') }}" class="border-2 border-white hover:bg-white hover:text-navy px-8 py-3 rounded-lg font-semibold transition">
                    Daftar Sekarang
                </a>
            @endguest
        </div>
    </div>
</section>

<section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-navy mb-12">Mengapa KomunaID?</h2>
        <div class="grid md:grid-cols-4 gap-8">
            <div class="text-center p-6">
                <div class="w-16 h-16 bg-soft-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">👥</span>
                </div>
                <h3 class="font-bold text-navy mb-2">Komunitas</h3>
                <p class="text-gray-500 text-sm">Buat dan kelola komunitasmu sendiri</p>
            </div>
            <div class="text-center p-6">
                <div class="w-16 h-16 bg-soft-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">🤝</span>
                </div>
                <h3 class="font-bold text-navy mb-2">Kolaborasi</h3>
                <p class="text-gray-500 text-sm">Hubungkan komunitas dengan brand</p>
            </div>
            <div class="text-center p-6">
                <div class="w-16 h-16 bg-soft-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">🎉</span>
                </div>
                <h3 class="font-bold text-navy mb-2">Event</h3>
                <p class="text-gray-500 text-sm">Buat dan kelola event komunitas</p>
            </div>
            <div class="text-center p-6">
                <div class="w-16 h-16 bg-soft-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">💰</span>
                </div>
                <h3 class="font-bold text-navy mb-2">Wallet</h3>
                <p class="text-gray-500 text-sm">Sistem pembayaran internal</p>
            </div>
        </div>
    </div>
</section>

<section class="py-16 bg-soft-bg">
    <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-navy mb-4">Platform Komunitas #1</h2>
        <p class="text-center text-gray-500 mb-12">Bergabung dengan ribuan komunitas di seluruh Indonesia</p>
        <div class="grid md:grid-cols-4 gap-8 text-center">
            <div class="bg-white rounded-xl p-6 shadow">
                <div class="text-3xl font-bold text-blue">{{ $stats['communities'] }}+</div>
                <div class="text-gray-500">Komunitas</div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow">
                <div class="text-3xl font-bold text-blue">{{ $stats['members'] }}+</div>
                <div class="text-gray-500">Member</div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow">
                <div class="text-3xl font-bold text-blue">{{ $stats['brands'] }}+</div>
                <div class="text-gray-500">Brand</div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow">
                <div class="text-3xl font-bold text-blue">{{ $stats['events'] }}+</div>
                <div class="text-gray-500">Event</div>
            </div>
        </div>
    </div>
</section>

@if($featuredCommunities->count())
<section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-navy mb-12">Komunitas Populer</h2>
        <div class="grid md:grid-cols-3 gap-6">
            @foreach($featuredCommunities as $community)
                <a href="{{ route('public.community-detail', $community->slug) }}" class="bg-white border rounded-xl p-6 hover:shadow-lg transition group">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold">
                            {{ substr($community->name, 0, 1) }}
                        </div>
                        <div>
                            <h3 class="font-bold text-navy group-hover:text-blue transition">{{ $community->name }}</h3>
                            <p class="text-xs text-gray-400">{{ $community->location ?? 'Indonesia' }}</p>
                        </div>
                    </div>
                    <p class="text-gray-500 text-sm mb-3 line-clamp-2">{{ $community->description ?? 'Tidak ada deskripsi' }}</p>
                    <div class="flex items-center gap-4 text-xs text-gray-400">
                        <span>👥 {{ $community->members_count }} anggota</span>
                        <span>📂 {{ ucfirst($community->category ?? 'umum') }}</span>
                    </div>
                </a>
            @endforeach
        </div>
        <div class="text-center mt-8">
            <a href="{{ route('public.communities') }}" class="text-blue hover:text-navy font-semibold">
                Lihat Semua Komunitas →
            </a>
        </div>
    </div>
</section>
@endif

<section class="py-16 bg-navy text-white">
    <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Siap Bergabung?</h2>
        <p class="text-gray-300 mb-8">Mulai kelola komunitasmu sekarang atau bergabung dengan komunitas yang sudah ada.</p>
        @guest
            <a href="{{ route('register') }}" class="bg-sky-blue hover:bg-blue text-white px-8 py-3 rounded-lg font-semibold transition">
                Daftar Gratis
            </a>
        @else
            <a href="{{ route('dashboard') }}" class="bg-sky-blue hover:bg-blue text-white px-8 py-3 rounded-lg font-semibold transition">
                Ke Dashboard
            </a>
        @endguest
    </div>
</section>
@endsection
