@extends('layouts.dashboard')

@section('content')
<div class="max-w-4xl mx-auto space-y-8">

    {{-- Back Button --}}
    <a href="{{ route('communities.directory') }}" class="inline-flex items-center gap-2 text-komuna-muted hover:text-komuna-text transition text-sm font-medium">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Komunitas Saya
    </a>

    {{-- Community Banner / Header --}}
    <div class="bg-komuna-surface border border-komuna-border rounded-2xl overflow-hidden">
        {{-- Banner --}}
        <div class="h-40 sm:h-52 bg-gradient-to-r from-komuna-blue to-komuna-cyan relative">
            @if($community->banner)
                <img src="{{ asset('storage/' . $community->banner) }}" alt="{{ $community->name }}" class="w-full h-full object-cover">
            @endif
        </div>

        <div class="p-6 md:p-8">
            <div class="flex flex-col sm:flex-row items-start gap-6 -mt-16 sm:-mt-12 relative z-10">
                {{-- Logo --}}
                <div class="flex-shrink-0">
                    <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-komuna-surface shadow-lg bg-komuna-light">
                        @if($community->logo)
                            <img src="{{ asset('storage/' . $community->logo) }}" alt="{{ $community->name }}" class="w-full h-full object-cover">
                        @else
                            <div class="w-full h-full bg-komuna-blue/10 flex items-center justify-center text-komuna-blue text-3xl font-bold">
                                {{ strtoupper(substr($community->name, 0, 1)) }}
                            </div>
                        @endif
                    </div>
                </div>

                <div class="flex-1 pt-2 sm:pt-4">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <h1 class="text-2xl font-bold text-komuna-text">{{ $community->name }}</h1>
                        @if($community->category)
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-komuna-teal/10 text-komuna-teal">
                                {{ $community->category->name }}
                            </span>
                        @endif
                    </div>

                    <div class="flex flex-wrap items-center gap-4 text-sm text-komuna-muted">
                        @if($community->city || $community->province)
                            <span class="inline-flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                {{ trim(($community->city ?? '') . ', ' . ($community->province ?? ''), ', ') }}
                            </span>
                        @endif
                        <span class="inline-flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            {{ $membersCount ?? $community->member_count ?? 0 }} anggota aktif
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Description --}}
    @if($community->description || $community->short_description)
        <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6 md:p-8">
            <h2 class="text-lg font-bold text-komuna-text mb-3">Tentang Komunitas</h2>
            @if($community->short_description)
                <p class="text-komuna-muted leading-relaxed">{{ $community->short_description }}</p>
            @endif
            @if($community->description && $community->description !== $community->short_description)
                <div class="mt-4 text-komuna-muted leading-relaxed prose prose-sm max-w-none">
                    {!! $community->description !!}
                </div>
            @endif
        </div>
    @endif

    {{-- Your Membership Info --}}
    <div class="bg-komuna-surface border border-komuna-border rounded-2xl p-6 md:p-8">
        <h2 class="text-lg font-bold text-komuna-text mb-4">Keanggotaan Anda</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="flex items-center gap-3 p-4 rounded-xl bg-komuna-light">
                <div class="w-10 h-10 bg-komuna-blue/10 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Role</p>
                    <p class="font-semibold text-komuna-text">{{ ucfirst($membership->role ?? 'Member') }}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 p-4 rounded-xl bg-komuna-light">
                <div class="w-10 h-10 bg-komuna-green/10 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-komuna-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Status</p>
                    <p class="font-semibold text-komuna-text">{{ ucfirst($membership->status ?? 'Active') }}</p>
                </div>
            </div>
        </div>

        {{-- Leave Button --}}
        @if(($membership->status ?? 'active') === 'active')
            <form action="{{ route('community_action.leave', $community->slug) }}" method="POST" class="inline">
                @csrf
                <button type="submit" onclick="return confirm('Yakin ingin keluar dari komunitas ini?')"
                    class="px-6 py-2.5 text-sm font-medium text-komuna-danger border border-komuna-danger/30 rounded-xl hover:bg-komuna-danger/10 transition">
                    Keluar dari Komunitas
                </button>
            </form>
        @endif
    </div>

</div>
@endsection
