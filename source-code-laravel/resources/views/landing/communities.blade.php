@extends('layouts.app')

@section('title', 'Daftar Komunitas - KomunaID')

@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Daftar Komunitas</h1>

    <form method="GET" action="{{ route('public.communities') }}" class="flex gap-4 mb-8">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari komunitas..."
            class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
        <select name="category" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
            <option value="">Semua Kategori</option>
            <option value="technology" {{ request('category') == 'technology' ? 'selected' : '' }}>Technology</option>
            <option value="business" {{ request('category') == 'business' ? 'selected' : '' }}>Business</option>
            <option value="music" {{ request('category') == 'music' ? 'selected' : '' }}>Music</option>
            <option value="art" {{ request('category') == 'art' ? 'selected' : '' }}>Art</option>
            <option value="sports" {{ request('category') == 'sports' ? 'selected' : '' }}>Sports</option>
        </select>
        <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Cari</button>
    </form>

    @if($communities->count())
        <div class="grid md:grid-cols-3 gap-6">
            @foreach($communities as $community)
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
        <div class="mt-8">
            {{ $communities->withQueryString()->links() }}
        </div>
    @else
        <div class="text-center py-16 text-gray-400">
            <p class="text-xl">Belum ada komunitas ditemukan.</p>
        </div>
    @endif
</div>
@endsection
