@extends('layouts.public')

@section('title', 'Blog — KomunaID')
@section('meta_description')
<meta name="description" content="Baca artikel, tips, dan insight terbaru seputar komunitas, kolaborasi, dan pertumbuhan dari KomunaID.">
@endsection

@section('content')
<section class="bg-gradient-to-br from-komuna-navy to-komuna-blue text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-4">Blog</h1>
        <p class="text-blue-200 text-lg">Artikel dan insight terbaru dari KomunaID.</p>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <form action="{{ route('blogs.index') }}" method="GET" class="flex-1 flex gap-2">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari artikel..." class="flex-1 rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            <button type="submit" class="bg-komuna-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-komuna-navy transition">Cari</button>
        </form>
        @if($categories->isNotEmpty())
            <div class="flex gap-2 flex-wrap">
                <a href="{{ route('blogs.index') }}" class="px-3 py-1.5 rounded-lg text-xs font-medium {{ !request('category') ? 'bg-komuna-blue text-white' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }} transition">Semua</a>
                @foreach($categories as $cat)
                    <a href="{{ route('blogs.index', ['category' => $cat]) }}" class="px-3 py-1.5 rounded-lg text-xs font-medium {{ request('category') === $cat ? 'bg-komuna-blue text-white' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }} transition">{{ $cat }}</a>
                @endforeach
            </div>
        @endif
    </div>

    @if($blogs->isNotEmpty())
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @each('public.partials.blog-card', $blogs, 'blog')
        </div>
        <div class="mt-8">
            {{ $blogs->links() }}
        </div>
    @else
        @include('public.partials.empty-state', [
            'title' => 'Belum Ada Artikel',
            'description' => 'Artikel blog akan segera tersedia. Nantikan terus!',
        ])
    @endif
</section>
@endsection
