@extends('layouts.dashboard')

@php $pageTitle = 'Cari Teman' @endphp

@section('content')
<div class="mb-8">
    <a href="{{ route('member.friends.index') }}" class="text-sm text-komuna-muted hover:text-komuna-teal transition inline-flex items-center gap-1 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Cari Teman</h1>
    <p class="text-komuna-muted">Temukan pengguna lain di KomunaID.</p>
</div>

<form method="GET" class="mb-6 flex gap-2">
    <input type="text" name="q" value="{{ old('q', $search) }}" placeholder="Cari berdasarkan nama atau username..."
           class="flex-1 border border-komuna-border rounded-lg px-4 py-2.5 text-sm bg-komuna-surface text-komuna-text focus:ring-2 focus:ring-komuna-cyan focus:border-komuna-cyan">
    <button type="submit" class="bg-komuna-cyan text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-komuna-cyan/90 transition">Cari</button>
</form>

@if($search && $users->count() > 0)
    <div class="space-y-3">
        @foreach($users as $user)
            <div class="bg-komuna-light rounded-2xl border border-komuna-border p-5 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                    @if($user->profile?->profile_photo)
                        <img src="{{ asset('storage/' . $user->profile->profile_photo) }}" alt="{{ $user->name }}" class="w-12 h-12 rounded-full object-cover">
                    @else
                        <div class="w-12 h-12 rounded-full bg-komuna-navy text-white flex items-center justify-center text-sm font-bold">
                            {{ strtoupper(substr($user->name, 0, 1)) }}
                        </div>
                    @endif
                    <div class="min-w-0">
                        <h3 class="font-semibold text-komuna-navy truncate">{{ $user->name }}</h3>
                        <p class="text-xs text-komuna-muted">@{{ $user->profile?->username ?? '-' }}</p>
                        @if($user->profile?->city)
                            <p class="text-xs text-komuna-muted">{{ $user->profile->city }}</p>
                        @endif
                    </div>
                </div>
                <div class="flex-shrink-0">
                    @php
                        $isFriend = auth()->user()->friends()->where('friend_id', $user->id)->exists()
                                    || $user->friends()->where('friend_id', auth()->id())->exists();
                        $hasPending = auth()->user()->sentFriendRequests()->where('friend_id', $user->id)->where('status', 'pending')->exists()
                                      || $user->sentFriendRequests()->where('friend_id', auth()->id())->where('status', 'pending')->exists();
                    @endphp
                    @if($isFriend)
                        <span class="text-xs font-medium text-komuna-green bg-komuna-green/10 px-3 py-1.5 rounded-lg">Teman</span>
                    @elseif($hasPending)
                        <span class="text-xs font-medium text-komuna-muted bg-komuna-surface px-3 py-1.5 rounded-lg border border-komuna-border">Menunggu</span>
                    @else
                        <form method="POST" action="{{ route('member.friends.request', $user) }}">
                            @csrf
                            <button type="submit" class="bg-komuna-cyan text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-komuna-cyan/90 transition">
                                Tambah Teman
                            </button>
                        </form>
                    @endif
                </div>
            </div>
        @endforeach
    </div>
@elseif($search)
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Tidak ditemukan pengguna dengan kata kunci tersebut.</h3>
        <p class="text-komuna-muted text-sm">Coba kata kunci yang berbeda.</p>
    </div>
@else
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">👥</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Mulai mencari teman.</h3>
        <p class="text-komuna-muted text-sm">Masukkan nama atau username untuk mencari pengguna.</p>
    </div>
@endif
@endsection
