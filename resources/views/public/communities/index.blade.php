@extends('layouts.public')

@section('title', 'Komunitas — KomunaID')
@section('meta_description')
<meta name="description" content="Jelajahi komunitas-komunitas terbaik di KomunaID. Temukan komunitas yang sesuai dengan minat dan passion Anda.">
@endsection

@section('content')
<section class="bg-gradient-to-br from-komuna-navy to-komuna-blue text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-4">Komunitas</h1>
        <p class="text-blue-200 text-lg">Temukan komunitas yang sesuai dengan minatmu.</p>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <form action="{{ route('communities.directory') }}" method="GET" class="mb-8">
        <div class="flex flex-col sm:flex-row gap-3">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari komunitas..." class="flex-1 rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            <select name="category" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="">Semua Kategori</option>
                @foreach($categories as $cat)
                    <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                @endforeach
            </select>
            <select name="region" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="">Semua Daerah</option>
                @foreach($regions as $r)
                    <option value="{{ $r }}" {{ request('region') == $r ? 'selected' : '' }}>{{ $r }}</option>
                @endforeach
            </select>
            <select name="sort" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="latest" {{ request('sort') === 'latest' ? 'selected' : '' }}>Terbaru</option>
                <option value="most_members" {{ request('sort') === 'most_members' ? 'selected' : '' }}>Terpopuler</option>
                <option value="recommended" {{ request('sort') === 'recommended' ? 'selected' : '' }}>Rekomendasi</option>
            </select>
            <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-komuna-navy transition">Cari</button>
        </div>
    </form>

    @if($communities->isNotEmpty())
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @each('public.partials.community-card', $communities, 'community')
        </div>
        <div class="mt-8">
            {{ $communities->links() }}
        </div>
    @else
        @include('public.partials.empty-state', [
            'title' => 'Belum Ada Komunitas',
            'description' => 'Komunitas belum tersedia saat ini. Nantikan terus!',
        ])
    @endif
</section>

@include('public.partials.cta-section', [
    'title' => 'Ingin Membuat Komunitas?',
    'description' => 'Daftar sekarang dan mulai bangun komunitasmu sendiri.',
    'cta_primary' => 'Gabung Sekarang',
    'cta_primary_url' => route('register'),
])
@endsection
