@extends('layouts.public')

@section('title', 'Events — KomunaID')
@section('meta_description')
<meta name="description" content="Temukan event menarik dari komunitas-komunitas terbaik di KomunaID.">
@endsection

@section('content')
<section class="bg-gradient-to-br from-komuna-navy to-komuna-blue text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-4">Events</h1>
        <p class="text-blue-200 text-lg">Temukan event menarik dari komunitas-komunitas terbaik.</p>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <form action="{{ route('events.index') }}" method="GET" class="mb-8">
        <div class="flex flex-col sm:flex-row gap-3">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari event..." class="flex-1 rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            <select name="event_type" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="">Semua Tipe</option>
                <option value="free" {{ request('event_type') === 'free' ? 'selected' : '' }}>Free</option>
                <option value="paid" {{ request('event_type') === 'paid' ? 'selected' : '' }}>Paid</option>
                <option value="collaboration" {{ request('event_type') === 'collaboration' ? 'selected' : '' }}>Collaboration</option>
                <option value="volunteer" {{ request('event_type') === 'volunteer' ? 'selected' : '' }}>Volunteer</option>
                <option value="charity" {{ request('event_type') === 'charity' ? 'selected' : '' }}>Charity</option>
            </select>
            <select name="location_type" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="">Semua Lokasi</option>
                <option value="online" {{ request('location_type') === 'online' ? 'selected' : '' }}>Online</option>
                <option value="offline" {{ request('location_type') === 'offline' ? 'selected' : '' }}>Offline</option>
                <option value="hybrid" {{ request('location_type') === 'hybrid' ? 'selected' : '' }}>Hybrid</option>
            </select>
            <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-komuna-navy transition">Cari</button>
        </div>
    </form>

    @if($events->isNotEmpty())
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($events as $event)
                <a href="{{ route('events.show', $event->slug) }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden hover:shadow-md transition group">
                    @if($event->banner_path)
                        <div class="h-40 bg-gradient-to-br from-komuna-blue to-komuna-cyan overflow-hidden">
                            <img src="{{ asset('storage/' . $event->banner_path) }}" alt="{{ $event->title }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        </div>
                    @else
                        <div class="h-40 bg-gradient-to-br from-komuna-blue to-komuna-cyan flex items-center justify-center">
                            <svg class="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                    @endif
                    <div class="p-5">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                @if($event->event_type === 'paid') bg-komuna-info-soft text-komuna-info
                                @elseif($event->event_type === 'free') bg-komuna-success-soft text-komuna-success
                                @elseif($event->event_type === 'volunteer') bg-teal-100 text-teal-800
                                @elseif($event->event_type === 'charity') bg-komuna-warning-soft text-orange-800
                                @else bg-komuna-light text-komuna-blue
                                @endif">
                                {{ ucfirst($event->event_type) }}
                            </span>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-komuna-border-soft text-komuna-muted">
                                {{ ucfirst($event->location_type) }}
                            </span>
                            @if($event->is_open_volunteer)
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold text-teal-700 bg-teal-50">Volunteer</span>
                            @endif
                            @if($event->is_open_donation)
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold text-orange-700 bg-komuna-warning-soft">Donasi</span>
                            @endif
                        </div>
                        <h3 class="font-bold text-komuna-text group-hover:text-komuna-blue transition mb-2 line-clamp-2">{{ $event->title }}</h3>
                        @if($event->community)
                            <p class="text-xs text-komuna-muted mb-2">{{ $event->community->name }}</p>
                        @endif
                        <div class="space-y-1 text-xs text-komuna-light-text">
                            <div class="flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                {{ $event->start_datetime ? $event->start_datetime->format('d M Y') : 'TBA' }}
                            </div>
                            <div class="flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                {{ $event->location_type === 'online' ? 'Online' : ($event->location_name ?? $event->location_address ?? 'TBA') }}
                            </div>
                        </div>
                        <div class="mt-3 flex items-center justify-between text-xs">
                            @if($event->isPaid())
                                <span class="font-semibold text-komuna-success">Rp {{ number_format($event->price) }}</span>
                            @else
                                <span class="font-semibold text-komuna-success">Free</span>
                            @endif
                        </div>
                    </div>
                </a>
            @endforeach
        </div>
        <div class="mt-8">
            {{ $events->links() }}
        </div>
    @else
        @include('public.partials.empty-state', [
            'title' => 'Belum Ada Event',
            'description' => 'Event akan segera tersedia. Nantikan terus!',
        ])
    @endif
</section>
@endsection
