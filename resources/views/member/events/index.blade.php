@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Events</h1>
        <p class="text-komuna-muted">Temukan event menarik dari komunitas.</p>
    </div>
    <a href="{{ route('member.events.my-registrations') }}" class="bg-komuna-success-soft text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition">
        My Registrations
    </a>
</div>

<form method="GET" class="mb-6 flex gap-3">
    <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari event..." class="flex-1 border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
    <select name="event_type" class="border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
        <option value="">Semua Tipe</option>
        <option value="free" {{ request('event_type') === 'free' ? 'selected' : '' }}>Free</option>
        <option value="paid" {{ request('event_type') === 'paid' ? 'selected' : '' }}>Paid</option>
        <option value="collaboration" {{ request('event_type') === 'collaboration' ? 'selected' : '' }}>Collaboration</option>
        <option value="volunteer" {{ request('event_type') === 'volunteer' ? 'selected' : '' }}>Volunteer</option>
        <option value="charity" {{ request('event_type') === 'charity' ? 'selected' : '' }}>Charity</option>
    </select>
    <button type="submit" class="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Cari</button>
</form>

@if($events->count() > 0)
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($events as $event)
            <a href="{{ route('events.show', $event) }}" class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5 hover:shadow-md transition block">
                <div class="flex items-center gap-2 mb-3">
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
                </div>
                <h3 class="font-semibold text-komuna-text mb-1">{{ $event->title }}</h3>
                <p class="text-xs text-komuna-muted mb-3">{{ $event->community->name }}</p>
                <p class="text-sm text-komuna-muted mb-3">{{ Str::limit($event->description, 100) }}</p>
                <div class="flex items-center justify-between text-xs text-komuna-muted">
                    <span>{{ $event->start_datetime->format('d M Y H:i') }}</span>
                    @if($event->isPaid())
                        <span class="font-semibold text-komuna-success">Rp {{ number_format($event->price) }}</span>
                    @else
                        <span class="font-semibold text-komuna-success">Free</span>
                    @endif
                </div>
            </a>
        @endforeach
    </div>
    <div class="mt-6">{{ $events->links() }}</div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">📅</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Event</h3>
        <p class="text-komuna-muted text-sm">Belum ada event yang tersedia saat ini.</p>
    </div>
@endif
@endsection
