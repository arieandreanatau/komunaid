@extends('layouts.dashboard')

@php $pageTitle = 'Teman' @endphp

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Teman</h1>
        <p class="text-komuna-muted">Kelola daftar teman Anda.</p>
    </div>
    <a href="{{ route('member.friends.search') }}"
       class="bg-komuna-cyan text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-cyan/90 transition inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        Cari Teman
    </a>
</div>

@php
    $activeTab = request('tab', 'friends');
    $tabs = [
        'friends' => ['label' => 'Teman', 'count' => $friends->count()],
        'incoming' => ['label' => 'Request Masuk', 'count' => $incomingRequests->count()],
        'outgoing' => ['label' => 'Request Keluar', 'count' => $outgoingRequests->count()],
    ];
@endphp
<div class="mb-6 flex gap-2 border-b border-komuna-border">
    @foreach($tabs as $key => $tab)
        <a href="{{ route('member.friends.index', ['tab' => $key]) }}"
           class="px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px
           {{ $activeTab === $key
               ? 'border-komuna-cyan text-komuna-cyan'
               : 'border-transparent text-komuna-muted hover:text-komuna-text' }}">
            {{ $tab['label'] }}
            @if($tab['count'] > 0)
                <span class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-komuna-cyan/10 text-komuna-cyan">{{ $tab['count'] }}</span>
            @endif
        </a>
    @endforeach
</div>

@if($activeTab === 'friends')
    @if($friends->count() > 0)
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @foreach($friends as $friendship)
                @php $friend = $friendship->friend; @endphp
                <div class="bg-komuna-light rounded-2xl border border-komuna-border p-5">
                    <div class="flex items-center gap-3 mb-3">
                        @if($friend->profile?->profile_photo)
                            <img src="{{ asset('storage/' . $friend->profile->profile_photo) }}" alt="{{ $friend->name }}" class="w-11 h-11 rounded-full object-cover">
                        @else
                            <div class="w-11 h-11 rounded-full bg-komuna-navy text-white flex items-center justify-center text-sm font-bold">
                                {{ strtoupper(substr($friend->name, 0, 1)) }}
                            </div>
                        @endif
                        <div class="min-w-0">
                            <h3 class="font-semibold text-komuna-navy truncate">{{ $friend->name }}</h3>
                            <p class="text-xs text-komuna-muted">@{{ $friend->profile?->username ?? '-' }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <a href="{{ route('member.friends.communities', $friend) }}"
                           class="flex-1 text-center text-xs font-medium text-komuna-teal bg-komuna-teal/10 px-3 py-1.5 rounded-lg hover:bg-komuna-teal/20 transition">
                            Komunitas
                        </a>
                        <form method="POST" action="{{ route('member.friends.remove', $friendship) }}" onsubmit="return confirm('Yakin ingin menghapus teman ini?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="text-xs font-medium text-komuna-danger bg-komuna-danger/10 px-3 py-1.5 rounded-lg hover:bg-komuna-danger/20 transition">
                                Hapus
                            </button>
                        </form>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
            <div class="text-4xl mb-3">&#x1F465;</div>
            <h3 class="font-semibold text-komuna-navy mb-1">Belum ada teman.</h3>
            <p class="text-komuna-muted text-sm">Mulai cari teman untuk terhubung.</p>
        </div>
    @endif

@elseif($activeTab === 'incoming')
    @if($incomingRequests->count() > 0)
        <div class="space-y-3">
            @foreach($incomingRequests as $friendship)
                @php $requester = $friendship->requester; @endphp
                <div class="bg-komuna-light rounded-2xl border border-komuna-border p-5 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3 min-w-0">
                        @if($requester->profile?->profile_photo)
                            <img src="{{ asset('storage/' . $requester->profile->profile_photo) }}" alt="{{ $requester->name }}" class="w-11 h-11 rounded-full object-cover">
                        @else
                            <div class="w-11 h-11 rounded-full bg-komuna-cyan text-white flex items-center justify-center text-sm font-bold">
                                {{ strtoupper(substr($requester->name, 0, 1)) }}
                            </div>
                        @endif
                        <div class="min-w-0">
                            <h3 class="font-semibold text-komuna-navy truncate">{{ $requester->name }}</h3>
                            <p class="text-xs text-komuna-muted">@{{ $requester->profile?->username ?? '-' }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <form method="POST" action="{{ route('member.friends.accept', $friendship) }}">
                            @csrf
                            <button type="submit" class="bg-komuna-green text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-komuna-green/90 transition">Terima</button>
                        </form>
                        <form method="POST" action="{{ route('member.friends.reject', $friendship) }}">
                            @csrf
                            <button type="submit" class="bg-komuna-surface text-komuna-danger text-xs font-medium px-3 py-1.5 rounded-lg border border-komuna-border hover:bg-komuna-soft transition">Tolak</button>
                        </form>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
            <div class="text-4xl mb-3">&#x1F4E5;</div>
            <h3 class="font-semibold text-komuna-navy mb-1">Tidak ada request masuk.</h3>
            <p class="text-komuna-muted text-sm">Belum ada yang mengirim permintaan pertemanan.</p>
        </div>
    @endif

@elseif($activeTab === 'outgoing')
    @if($outgoingRequests->count() > 0)
        <div class="space-y-3">
            @foreach($outgoingRequests as $friendship)
                @php $target = $friendship->friend; @endphp
                <div class="bg-komuna-light rounded-2xl border border-komuna-border p-5 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3 min-w-0">
                        @if($target->profile?->profile_photo)
                            <img src="{{ asset('storage/' . $target->profile->profile_photo) }}" alt="{{ $target->name }}" class="w-11 h-11 rounded-full object-cover">
                        @else
                            <div class="w-11 h-11 rounded-full bg-komuna-blue text-white flex items-center justify-center text-sm font-bold">
                                {{ strtoupper(substr($target->name, 0, 1)) }}
                            </div>
                        @endif
                        <div class="min-w-0">
                            <h3 class="font-semibold text-komuna-navy truncate">{{ $target->name }}</h3>
                            <p class="text-xs text-komuna-muted">@{{ $target->profile?->username ?? '-' }}</p>
                        </div>
                    </div>
                    <span class="text-xs font-medium text-komuna-muted bg-komuna-surface px-3 py-1.5 rounded-lg border border-komuna-border">Menunggu...</span>
                </div>
            @endforeach
        </div>
    @else
        <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
            <div class="text-4xl mb-3">&#x1F4E4;</div>
            <h3 class="font-semibold text-komuna-navy mb-1">Tidak ada request keluar.</h3>
            <p class="text-komuna-muted text-sm">Anda belum mengirim permintaan pertemanan.</p>
        </div>
    @endif
@endif
@endsection
