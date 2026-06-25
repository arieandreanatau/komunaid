@extends('layouts.dashboard')

@php $pageTitle = 'Riwayat Aktivitas' @endphp

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Riwayat Aktivitas</h1>
    <p class="text-komuna-muted">Pantau semua aktivitas akun Anda.</p>
</div>

<div class="mb-6">
    <form method="GET" class="flex gap-2 items-center">
        <label class="text-sm font-medium text-komuna-text">Filter:</label>
        <select name="type" onchange="this.form.submit()"
                class="border border-komuna-border rounded-lg px-3 py-2 text-sm text-komuna-text bg-komuna-surface focus:ring-2 focus:ring-komuna-teal focus:border-komuna-teal">
            <option value="">Semua Tipe</option>
            @php
                $types = [
                    'profile_updated' => 'Profil Diperbarui',
                    'interest_updated' => 'Interest Diperbarui',
                    'community_joined' => 'Bergabung Komunitas',
                    'community_left' => 'Keluar Komunitas',
                    'event_registered' => 'Daftar Event',
                    'event_cancelled' => 'Batalkan Event',
                    'friend_requested' => 'Request Pertemanan',
                    'friend_accepted' => 'Terima Pertemanan',
                    'bookmark_added' => 'Bookmark Ditambahkan',
                    'bookmark_removed' => 'Bookmark Dihapus',
                    'gallery_uploaded' => 'Galeri Diunggah',
                ];
            @endphp
            @foreach($types as $typeKey => $typeLabel)
                <option value="{{ $typeKey }}" {{ request('type') === $typeKey ? 'selected' : '' }}>{{ $typeLabel }}</option>
            @endforeach
        </select>
    </form>
</div>

@if($histories->count() > 0)
    <div class="bg-komuna-light rounded-2xl border border-komuna-border overflow-hidden">
        <div class="divide-y divide-komuna-border">
            @foreach($histories as $history)
                @php
                    $typeConfig = match($history->type) {
                        'profile_updated' => ['label' => 'Profil Diperbarui', 'color' => 'bg-komuna-blue/10 text-komuna-blue'],
                        'interest_updated' => ['label' => 'Interest Diperbarui', 'color' => 'bg-komuna-teal/10 text-komuna-teal'],
                        'community_joined' => ['label' => 'Bergabung Komunitas', 'color' => 'bg-komuna-green/10 text-komuna-green'],
                        'community_left' => ['label' => 'Keluar Komunitas', 'color' => 'bg-komuna-orange/10 text-komuna-orange'],
                        'event_registered' => ['label' => 'Daftar Event', 'color' => 'bg-komuna-cyan/10 text-komuna-cyan'],
                        'event_cancelled' => ['label' => 'Batalkan Event', 'color' => 'bg-komuna-orange/10 text-komuna-orange'],
                        'friend_requested' => ['label' => 'Request Pertemanan', 'color' => 'bg-komuna-blue/10 text-komuna-blue'],
                        'friend_accepted' => ['label' => 'Terima Pertemanan', 'color' => 'bg-komuna-green/10 text-komuna-green'],
                        'bookmark_added' => ['label' => 'Bookmark Ditambahkan', 'color' => 'bg-komuna-teal/10 text-komuna-teal'],
                        'bookmark_removed' => ['label' => 'Bookmark Dihapus', 'color' => 'bg-komuna-orange/10 text-komuna-orange'],
                        'gallery_uploaded' => ['label' => 'Galeri Diunggah', 'color' => 'bg-komuna-cyan/10 text-komuna-cyan'],
                        default => ['label' => ucfirst(str_replace('_', ' ', $history->type)), 'color' => 'bg-komuna-soft text-komuna-muted'],
                    };
                @endphp
                <div class="px-5 py-4 flex items-start gap-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap {{ $typeConfig['color'] }}">
                        {{ $typeConfig['label'] }}
                    </span>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-medium text-komuna-navy">{{ $history->title ?? ucfirst(str_replace('_', ' ', $history->type)) }}</h4>
                        @if($history->description)
                            <p class="text-xs text-komuna-muted mt-0.5">{{ $history->description }}</p>
                        @endif
                    </div>
                    <span class="text-xs text-komuna-muted whitespace-nowrap flex-shrink-0">{{ $history->created_at->format('d M Y H:i') }}</span>
                </div>
            @endforeach
        </div>
    </div>
    <div class="mt-6">{{ $histories->links() }}</div>
@else
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">📋</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Belum ada riwayat aktivitas.</h3>
        <p class="text-komuna-muted text-sm">Aktivitas Anda akan tercatat di sini.</p>
    </div>
@endif
@endsection
