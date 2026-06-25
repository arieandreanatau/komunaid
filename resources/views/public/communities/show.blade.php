@extends('layouts.public')

@section('title', $community->name . ' — KomunaID')
@section('meta_description')
<meta name="description" content="{{ $community->short_description ?? Str::limit($community->description, 160) }}">
@endsection

@section('content')
<section class="bg-gradient-to-br from-komuna-navy to-komuna-blue text-white py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <a href="{{ route('communities.directory') }}" class="inline-flex items-center gap-1 text-sm text-blue-200 hover:text-white mb-6 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Komunitas
        </a>
        <div class="flex items-start gap-4">
            @if($community->logo_path)
                <img src="{{ asset('storage/' . $community->logo_path) }}" alt="{{ $community->name }}" class="w-16 h-16 rounded-2xl object-cover border-2 border-white/20">
            @else
                <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white/40">
                    {{ strtoupper(substr($community->name, 0, 2)) }}
                </div>
            @endif
            <div>
                <h1 class="text-3xl font-extrabold">{{ $community->name }}</h1>
                <div class="flex items-center gap-3 mt-2 text-blue-200 text-sm">
                    @if($community->category)
                        <span class="bg-white/10 px-2 py-0.5 rounded-full">{{ $community->category->name }}</span>
                    @endif
                    <span>{{ $community->city ?? $community->region ?? 'Indonesia' }}</span>
                    <span>{{ $community->active_members_count ?? 0 }} anggota</span>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
            @if($community->about || $community->description)
                <div class="prose prose-lg max-w-none prose-headings:text-komuna-navy mb-8">
                    {!! $community->about ?? $community->description !!}
                </div>
            @endif
        </div>
        <div>
            <div class="bg-white rounded-2xl border border-komuna-border-soft p-6 sticky top-24">
                <h3 class="font-bold text-komuna-text mb-4">Info Komunitas</h3>
                <div class="space-y-3 text-sm">
                    @if($community->owner)
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-komuna-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            <span class="text-komuna-muted">Owner: <strong>{{ $community->owner->name }}</strong></span>
                        </div>
                    @endif
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-komuna-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span class="text-komuna-muted">{{ $community->active_members_count ?? 0 }} anggota aktif</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-komuna-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span class="text-komuna-muted">{{ $community->city ?? 'Indonesia' }}</span>
                    </div>
                    @if($community->visibility)
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-komuna-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            <span class="text-komuna-muted">{{ ucfirst($community->visibility) }}</span>
                        </div>
                    @endif
                </div>
                @guest
                    <a href="{{ route('register') }}" class="block w-full bg-komuna-blue text-white text-center px-4 py-2.5 rounded-xl mt-6 font-semibold hover:bg-komuna-navy transition">
                        Gabung Sekarang
                    </a>
                @endguest
            </div>
        </div>
    </div>
</section>

@if($relatedCommunities->isNotEmpty())
<section class="bg-komuna-light py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-bold text-komuna-text mb-6">Komunitas Serupa</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @each('public.partials.community-card', $relatedCommunities, 'community')
        </div>
    </div>
</section>
@endif
@endsection
