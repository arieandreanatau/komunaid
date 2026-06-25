@extends('layouts.dashboard')

@php $pageTitle = 'Bookmark Komunitas' @endphp

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Bookmark Komunitas</h1>
    <p class="text-komuna-muted">{{ $bookmarks->count() }} komunitas tersimpan.</p>
</div>

@if($bookmarks->count() > 0)
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @foreach($bookmarks as $bookmark)
            @php $community = $bookmark->community; @endphp
            <div class="bg-komuna-light rounded-2xl border border-komuna-border p-5 hover:shadow-md transition">
                <a href="{{ route('communities.show', $community) }}" class="block mb-3">
                    <div class="flex items-center gap-3">
                        @if($community->logo)
                            <img src="{{ asset('storage/' . $community->logo) }}" alt="{{ $community->name }}" class="w-10 h-10 rounded-full object-cover">
                        @else
                            <div class="w-10 h-10 rounded-full bg-komuna-blue text-white flex items-center justify-center text-sm font-bold">
                                {{ strtoupper(substr($community->name, 0, 1)) }}
                            </div>
                        @endif
                        <div class="min-w-0">
                            <h3 class="font-semibold text-komuna-navy truncate">{{ $community->name }}</h3>
                            @if($community->category)
                                <span class="text-xs text-komuna-teal">{{ $community->category->name }}</span>
                            @endif
                        </div>
                    </div>
                </a>
                @if($community->city || $community->province)
                    <p class="text-xs text-komuna-muted flex items-center gap-1 mb-3">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {{ $community->city }}{{ $community->city && $community->province ? ', ' : '' }}{{ $community->province }}
                    </p>
                @endif
                <div class="flex items-center justify-between">
                    <span class="text-xs text-komuna-muted">Disimpan {{ $bookmark->created_at->format('d M Y') }}</span>
                    <form method="POST" action="{{ route('member.bookmarks.destroy', $community) }}" onsubmit="return confirm('Hapus bookmark komunitas ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="text-xs font-medium text-komuna-danger hover:text-komuna-danger/80 transition inline-flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                            Hapus
                        </button>
                    </form>
                </div>
            </div>
        @endforeach
    </div>
@else
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">??</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Belum ada komunitas yang disimpan.</h3>
        <p class="text-komuna-muted text-sm mb-4">Jelajahi komunitas dan simpan yang menarik.</p>
        <a href="{{ route('communities.directory') }}" class="inline-block bg-komuna-teal text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-komuna-teal/90 transition">
            Jelajahi Komunitas
        </a>
    </div>
@endif
@endsection
