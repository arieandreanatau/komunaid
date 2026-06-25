@extends('layouts.public')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Direktori Komunitas</h1>
    <p class="text-komuna-muted mt-1">Temukan komunitas yang sesuai dengan minatmu.</p>
</div>

<form method="GET" action="{{ route('communities.directory') }}" class="mb-8 bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 sm:p-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Cari Komunitas</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nama, deskripsi, kota..."
                   class="w-full border-komuna-border rounded-lg focus:ring-komuna-blue focus:border-komuna-blue text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Kategori</label>
            <select name="category" class="w-full border-komuna-border rounded-lg focus:ring-komuna-blue focus:border-komuna-blue text-sm">
                <option value="">Semua Kategori</option>
                @foreach($categories as $cat)
                    <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>
                        {{ $cat->icon }} {{ $cat->name }}
                    </option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Regional</label>
            <select name="region" class="w-full border-komuna-border rounded-lg focus:ring-komuna-blue focus:border-komuna-blue text-sm">
                <option value="">Semua Regional</option>
                @foreach($regions as $region)
                    <option value="{{ $region }}" {{ request('region') == $region ? 'selected' : '' }}>
                        {{ $region }}
                    </option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Jumlah Member</label>
            <select name="member_sort" class="w-full border-komuna-border rounded-lg focus:ring-komuna-blue focus:border-komuna-blue text-sm">
                <option value="">Default</option>
                <option value="most" {{ request('member_sort') == 'most' ? 'selected' : '' }}>Paling banyak</option>
                <option value="least" {{ request('member_sort') == 'least' ? 'selected' : '' }}>Paling sedikit</option>
            </select>
        </div>
    </div>
    <div class="mt-4 flex justify-end gap-2">
        <a href="{{ route('communities.directory') }}" class="px-4 py-2 text-sm text-komuna-muted hover:text-komuna-text">Reset</a>
        <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Cari
        </button>
    </div>
</form>

@if($communities->count() > 0)
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($communities as $community)
            <a href="{{ route('communities.detail', $community->slug) }}" class="block bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden hover:shadow-md transition group">
                <div class="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
                    @if($community->logo)
                        <img src="{{ $community->logo }}" alt="{{ $community->name }}" class="w-full h-full object-cover">
                    @else
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-4xl text-white/80 font-bold">{{ substr($community->name, 0, 1) }}</span>
                        </div>
                    @endif
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16"></div>
                </div>
                <div class="p-5">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-bold text-komuna-text group-hover:text-komuna-success transition text-lg leading-tight">{{ $community->name }}</h3>
                    </div>
                    <span class="inline-block bg-komuna-success-soft text-komuna-success text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                        {{ $community->category->icon }} {{ $community->category->name }}
                    </span>
                    <p class="text-komuna-muted text-sm mb-3 line-clamp-2">{{ $community->description }}</p>
                    <div class="flex items-center justify-between text-xs text-komuna-light-text">
                        <span class="flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            {{ $community->city ?? $community->region ?? 'Online' }}
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
                            {{ $community->active_members_count }} member
                        </span>
                    </div>
                </div>
            </a>
        @endforeach
    </div>

    <div class="mt-10">
        {{ $communities->links() }}
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-12 text-center">
        <div class="text-5xl mb-4">🏘️</div>
        <h3 class="text-xl font-bold text-komuna-text mb-2">Belum Ada Komunitas</h3>
        <p class="text-komuna-muted mb-6 max-w-md mx-auto">Saat ini belum ada komunitas yang tersedia. Nantikan komunitas baru atau buat komunitasmu sendiri setelah login.</p>
        @auth
            <a href="{{ route('member.dashboard') }}" class="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Dashboard
            </a>
        @else
            <a href="{{ route('register') }}" class="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Daftar Sekarang
            </a>
        @endguest
    </div>
@endif
@endsection
