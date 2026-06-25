@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">{{ $event->title }}</h1>
        <p class="text-komuna-muted">{{ $event->community->name }}</p>
    </div>
    <div class="flex items-center gap-3 flex-wrap">
        @if(($event->status ?? 'draft') === 'draft')
            <form action="{{ route('community.events.publish', $event) }}" method="POST" class="inline">@csrf<button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Publish</button></form>
        @endif
        @if(($event->status ?? 'draft') === 'published')
            <form action="{{ route('community.events.cancel', $event) }}" method="POST" class="inline" onsubmit="return confirm('Yakin?')">@csrf<button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Cancel</button></form>
        @endif
        @if(in_array(($event->status ?? 'draft'), ['published','cancelled']))
            <form action="{{ route('community.events.archive', $event) }}" method="POST" class="inline" onsubmit="return confirm('Yakin arsipkan?')">@csrf<button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Archive</button></form>
        @endif
        <a href="{{ route('community.events.edit', $event) }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Edit</a>
        <a href="{{ route('community.events.registrations', $event) }}" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Registrasi</a>
        <a href="{{ route('community.events.galleries.index', $event) }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Gallery</a>
        <a href="{{ route('community.events.chats.index', $event) }}" class="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">Chat</a>
        <form action="{{ route('community.events.destroy', $event) }}" method="POST" onsubmit="return confirm('Hapus?')" class="inline"><button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Hapus</button>@csrf@method('DELETE')</form>
    </div>
</div>
@if($event->banner)
    <img src="{{ asset('storage/' . $event->banner) }}" class="w-full h-48 object-cover rounded-xl mb-6">
@endif
<nav class="flex flex-wrap gap-1 mb-6 bg-komuna-border-soft rounded-lg p-1">
    <a href="#overview" class="px-4 py-2 rounded-lg text-sm font-medium bg-white text-komuna-text shadow-sm">Overview</a>
    <a href="{{ route('community.events.participants', $event) }}" class="px-4 py-2 rounded-lg text-sm font-medium text-komuna-muted hover:text-komuna-text">Peserta ({{ $stats['total_registrations'] }})</a>
    <a href="{{ route('community.events.volunteer-campaign.index', $event) }}" class="px-4 py-2 rounded-lg text-sm font-medium text-komuna-muted hover:text-komuna-text">Kampanye ({{ $stats['volunteer_campaigns_count'] ?? 0 }})</a>
    <a href="{{ route('community.events.volunteers', $event) }}" class="px-4 py-2 rounded-lg text-sm font-medium text-komuna-muted hover:text-komuna-text">Volunteers ({{ $stats['volunteers_count'] ?? 0 }})</a>
    <a href="{{ route('community.events.donations', $event) }}" class="px-4 py-2 rounded-lg text-sm font-medium text-komuna-muted hover:text-komuna-text">Donasi (Rp {{ number_format($stats['donations_total'] ?? 0) }})</a>
    <a href="{{ route('community.events.finance.index', $event) }}" class="px-4 py-2 rounded-lg text-sm font-medium text-komuna-muted hover:text-komuna-text">Keuangan</a>
    <a href="#settings" class="px-4 py-2 rounded-lg text-sm font-medium text-komuna-muted hover:text-komuna-text">Settings</a>
</nav><div id="overview" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Detail Event</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><p class="text-xs text-komuna-muted">Tipe Event</p><span class="px-2 py-1 rounded-full text-xs font-medium bg-komuna-light text-komuna-blue">{{ ucfirst($event->event_type) }}</span></div>
                <div><p class="text-xs text-komuna-muted">Status V2</p><span class="px-2 py-1 rounded-full text-xs font-medium @if(($event->status ?? 'draft') === 'published') bg-komuna-success-soft text-komuna-success @elseif(($event->status ?? 'draft') === 'cancelled') bg-komuna-danger-soft text-komuna-danger @else bg-komuna-border-soft text-komuna-text @endif">{{ ucfirst($event->status ?? 'draft') }}</span></div>
                <div><p class="text-xs text-komuna-muted">Lokasi</p><p class="text-sm font-medium text-komuna-text">{{ $event->location_name ?? ucfirst($event->location_type) }}</p></div>
                <div><p class="text-xs text-komuna-muted">Kota</p><p class="text-sm font-medium text-komuna-text">{{ $event->city ?? '-' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Provinsi</p><p class="text-sm font-medium text-komuna-text">{{ $event->province ?? '-' }}</p></div>
                <div><p class="text-xs text-komuna-muted">URL Online</p><p class="text-sm font-medium text-komuna-text">{{ $event->online_url ?? '-' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Tanggal Mulai</p><p class="text-sm font-medium text-komuna-text">{{ $event->start_datetime->format('d M Y H:i') }}</p></div>
                <div><p class="text-xs text-komuna-muted">Tanggal Selesai</p><p class="text-sm font-medium text-komuna-text">{{ $event->end_datetime->format('d M Y H:i') }}</p></div>
                <div><p class="text-xs text-komuna-muted">Kapasitas</p><p class="text-sm font-medium text-komuna-text">{{ $event->capacity ?? 'Unlimited' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Charity</p><p class="text-sm font-medium text-komuna-text">{{ $event->is_charity ? 'Ya' : 'Tidak' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Volunteer</p><p class="text-sm font-medium text-komuna-text">{{ $event->is_open_volunteer ? 'Ya' : 'Tidak' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Donation</p><p class="text-sm font-medium text-komuna-text">{{ $event->is_open_donation ? 'Ya' : 'Tidak' }}</p></div>
            </div>
            @if($event->description)
                <div class="mt-6"><p class="text-xs text-komuna-muted mb-1">Deskripsi</p><p class="text-sm text-komuna-text">{{ $event->description }}</p></div>
            @endif
            @if($event->short_description)
                <div class="mt-4"><p class="text-xs text-komuna-muted mb-1">Deskripsi Singkat</p><p class="text-sm text-komuna-text">{{ $event->short_description }}</p></div>
            @endif
        </div>
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Statistik</h3>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Registrasi</span><span class="font-medium text-komuna-text">{{ $stats['total_registrations'] }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Volunteers</span><span class="font-medium text-komuna-text">{{ $stats['volunteers_count'] ?? 0 }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Donasi</span><span class="font-medium text-komuna-text">Rp {{ number_format($stats['donations_total'] ?? 0) }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Saldo</span><span class="font-medium text-komuna-text">Rp {{ number_format($stats['balance'] ?? 0) }}</span></div>
            </div>
        </div>
        <div id="settings" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Settings</h3>
            <div class="space-y-2">
                @if(($event->status ?? 'draft') === 'draft')
                    <form action="{{ route('community.events.publish', $event) }}" method="POST">@csrf<button class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Publish Event</button></form>
                @endif
                @if(($event->status ?? 'draft') === 'published')
                    <form action="{{ route('community.events.cancel', $event) }}" method="POST" onsubmit="return confirm('Yakin?')">@csrf<button class="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Cancel Event</button></form>
                @endif
                @if(in_array(($event->status ?? 'draft'), ['published','cancelled']))
                    <form action="{{ route('community.events.archive', $event) }}" method="POST" onsubmit="return confirm('Yakin arsipkan?')">@csrf<button class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Archive Event</button></form>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection