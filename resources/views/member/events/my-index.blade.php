@extends('layouts.dashboard')

@php $pageTitle = 'Event Saya' @endphp

@section('content')
<div class="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Event Saya</h1>
        <p class="text-komuna-muted">{{ $registrations->total() }} event yang Anda ikuti.</p>
    </div>
    <a href="{{ route('member.events.export') }}"
       class="bg-komuna-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-teal/90 transition inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Export CSV
    </a>
</div>

<div class="mb-6 flex flex-col sm:flex-row gap-4">
    <div class="flex gap-2 flex-wrap">
        @php $filters = ['all' => 'Semua', 'registered' => 'Terdaftar', 'attended' => 'Dihadiri', 'cancelled' => 'Dibatalkan']; @endphp
        @foreach($filters as $key => $label)
            <a href="{{ route('events.index', array_merge(request()->except('filter', 'page'), ['filter' => $key])) }}"
               class="px-4 py-1.5 rounded-full text-sm font-medium transition border
               {{ request('filter', 'all') === $key
                   ? 'bg-komuna-navy text-white border-komuna-navy'
                   : 'bg-komuna-light text-komuna-text border-komuna-border hover:bg-komuna-soft' }}">
                {{ $label }}
            </a>
        @endforeach
    </div>
    <form method="GET" class="flex-1 flex gap-2">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari event..."
               class="flex-1 border border-komuna-border rounded-lg px-4 py-2 text-sm bg-komuna-surface text-komuna-text focus:ring-2 focus:ring-komuna-teal focus:border-komuna-teal">
        <button type="submit" class="bg-komuna-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-blue/90 transition">Cari</button>
    </form>
</div>

@if($registrations->count() > 0)
    <div class="space-y-4">
        @foreach($registrations as $registration)
            @php $event = $registration->event; @endphp
            <div class="bg-komuna-light rounded-2xl border border-komuna-border p-5 hover:shadow-md transition">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-komuna-soft flex-shrink-0">
                        @if($event->banner)
                            <img src="{{ asset('storage/' . $event->banner) }}" alt="{{ $event->title }}" class="w-full h-full object-cover">
                        @else
                            <div class="w-full h-full flex items-center justify-center text-komuna-muted">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                        @endif
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <h3 class="font-semibold text-komuna-navy">{{ $event->title }}</h3>
                                <p class="text-xs text-komuna-muted">{{ $event->community->name }}</p>
                            </div>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap
                                @if($registration->status === 'registered') bg-komuna-green/10 text-komuna-green
                                @elseif($registration->status === 'attended') bg-komuna-blue/10 text-komuna-blue
                                @else bg-komuna-orange/10 text-komuna-orange
                                @endif">
                                {{ ucfirst($registration->status) }}
                            </span>
                        </div>
                        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-komuna-muted">
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                {{ $event->start_datetime->format('d M Y H:i') }}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                {{ ucfirst($event->location_type) }}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Daftar: {{ $registration->registered_at ? $registration->registered_at->format('d M Y') : '-' }}
                            </span>
                        </div>
                        <div class="mt-3 flex items-center gap-3">
                            <a href="{{ route('events.show', $event) }}" class="text-xs font-medium text-komuna-teal hover:text-komuna-teal/80 transition">Lihat Detail</a>
                            @if($registration->status === 'registered')
                                <form method="POST" action="{{ route('member.events.cancel', [$event->slug, $registration->id]) }}" onsubmit="return confirm('Yakin ingin membatalkan pendaftaran event ini?')">
                                    @csrf
                                    <button type="submit" class="text-xs font-medium text-komuna-danger hover:text-komuna-danger/80 transition">Batalkan</button>
                                </form>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
    <div class="mt-6">{{ $registrations->links() }}</div>
@else
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">📅</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Belum ada event yang diikuti.</h3>
        <p class="text-komuna-muted text-sm mb-4">Mulai jelajahi event menarik dari komunitas Anda.</p>
        <a href="{{ route('events.index') }}" class="inline-block bg-komuna-teal text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-komuna-teal/90 transition">
            Jelajahi Event
        </a>
    </div>
@endif
@endsection
