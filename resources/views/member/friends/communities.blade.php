@extends('layouts.dashboard')

@php $pageTitle = 'Komunitas ' . $user->name @endphp

@section('content')
<div class="mb-8">
    <a href="{{ route('member.friends.index') }}" class="text-sm text-komuna-muted hover:text-komuna-teal transition inline-flex items-center gap-1 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <div class="flex items-center gap-3">
        @if($user->profile?->profile_photo)
            <img src="{{ asset('storage/' . $user->profile->profile_photo) }}" alt="{{ $user->name }}" class="w-14 h-14 rounded-full object-cover">
        @else
            <div class="w-14 h-14 rounded-full bg-komuna-navy text-white flex items-center justify-center text-lg font-bold">
                {{ strtoupper(substr($user->name, 0, 1)) }}
            </div>
        @endif
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Komunitas {{ $user->name }}</h1>
            <p class="text-komuna-muted">Komunitas yang diikuti oleh {{ $user->name }}.</p>
        </div>
    </div>
</div>

@if($user->privacy === 'private')
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">🔒</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Profil pengguna ini bersifat privat.</h3>
        <p class="text-komuna-muted text-sm">Informasi komunitas tidak tersedia.</p>
    </div>
@elseif($user->privacy === 'friends' && !$isFriend)
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">🔒</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Anda perlu menjadi teman untuk melihat komunitas ini.</h3>
        <p class="text-komuna-muted text-sm">Kirim permintaan pertemanan terlebih dahulu.</p>
    </div>
@else
    @if($communities->count() > 0)
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @foreach($communities as $community)
                <a href="{{ route('communities.show', $community) }}" class="bg-komuna-light rounded-2xl border border-komuna-border p-5 hover:shadow-md transition block">
                    <div class="flex items-center gap-3 mb-3">
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
                                <span class="text-xs text-komuna-muted">{{ $community->category->name }}</span>
                            @endif
                        </div>
                    </div>
                    @if($community->city || $community->province)
                        <p class="text-xs text-komuna-muted flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            {{ $community->city }}{{ $community->city && $community->province ? ', ' : '' }}{{ $community->province }}
                        </p>
                    @endif
                </a>
            @endforeach
        </div>
    @else
        <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
            <div class="text-4xl mb-3">🏘️</div>
            <h3 class="font-semibold text-komuna-navy mb-1">Pengguna ini belum bergabung dengan komunitas publik.</h3>
            <p class="text-komuna-muted text-sm">Tidak ada komunitas publik yang ditampilkan.</p>
        </div>
    @endif
@endif
@endsection
