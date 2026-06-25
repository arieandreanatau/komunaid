@extends('layouts.public')

@section('title', $blog->title . ' — KomunaID')
@section('meta_description')
<meta name="description" content="{{ $blog->excerpt ?? Str::limit(strip_tags($blog->content), 160) }}">
@endsection

@section('content')
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <a href="{{ route('blogs.index') }}" class="inline-flex items-center gap-1 text-sm text-komuna-blue hover:text-komuna-navy mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali ke Blog
    </a>

    @if($blog->cover_path)
        <div class="rounded-2xl overflow-hidden mb-8">
            <img src="{{ asset('storage/' . $blog->cover_path) }}" alt="{{ $blog->title }}" class="w-full h-64 sm:h-80 object-cover">
        </div>
    @endif

    <div class="flex items-center gap-3 mb-4">
        @if($blog->category)
            <span class="text-xs font-semibold text-komuna-blue bg-komuna-light px-2.5 py-1 rounded-full">{{ $blog->category }}</span>
        @endif
        <span class="text-sm text-komuna-light-text">{{ $blog->published_at ? $blog->published_at->format('d M Y') : '' }}</span>
    </div>

    <h1 class="text-3xl sm:text-4xl font-extrabold text-komuna-text mb-4">{{ $blog->title }}</h1>

    @if($blog->author)
        <div class="flex items-center gap-3 mb-8 pb-8 border-b border-komuna-border-soft">
            <div class="w-10 h-10 bg-komuna-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                {{ substr($blog->author->name, 0, 1) }}
            </div>
            <div>
                <p class="text-sm font-medium text-komuna-text">{{ $blog->author->name }}</p>
                <p class="text-xs text-komuna-light-text">{{ $blog->published_at ? $blog->published_at->diffForHumans() : '' }}</p>
            </div>
        </div>
    @endif

    <div class="prose prose-lg max-w-none prose-headings:text-komuna-navy prose-a:text-komuna-blue prose-img:rounded-xl">
        {!! $blog->content !!}
    </div>

    @if($blog->tags && count($blog->tags) > 0)
        <div class="flex flex-wrap gap-2 mt-8 pt-8 border-t border-komuna-border-soft">
            @foreach($blog->tags as $tag)
                <span class="text-xs bg-komuna-border-soft text-komuna-muted px-3 py-1 rounded-full">{{ $tag }}</span>
            @endforeach
        </div>
    @endif
</article>

@if($relatedBlogs->isNotEmpty())
<section class="bg-komuna-light py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-bold text-komuna-text mb-6">Artikel Terkait</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @each('public.partials.blog-card', $relatedBlogs, 'blog')
        </div>
    </div>
</section>
@endif
@endsection
