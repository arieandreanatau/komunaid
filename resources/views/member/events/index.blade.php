@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
        <p class="text-gray-600">Temukan event menarik dari komunitas.</p>
    </div>
    <a href="{{ route('member.events.my-registrations') }}" class="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition">
        My Registrations
    </a>
</div>

<form method="GET" class="mb-6 flex gap-3">
    <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari event..." class="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
    <select name="event_type" class="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
        <option value="">Semua Tipe</option>
        <option value="free" {{ request('event_type') === 'free' ? 'selected' : '' }}>Free</option>
        <option value="paid" {{ request('event_type') === 'paid' ? 'selected' : '' }}>Paid</option>
        <option value="collaboration" {{ request('event_type') === 'collaboration' ? 'selected' : '' }}>Collaboration</option>
    </select>
    <button type="submit" class="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Cari</button>
</form>

@if($events->count() > 0)
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($events as $event)
            <a href="{{ route('events.show', $event) }}" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition block">
                <div class="flex items-center gap-2 mb-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium
                        @if($event->event_type === 'paid') bg-purple-100 text-purple-800
                        @elseif($event->event_type === 'free') bg-green-100 text-green-800
                        @else bg-blue-100 text-blue-800
                        @endif">
                        {{ ucfirst($event->event_type) }}
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {{ ucfirst($event->location_type) }}
                    </span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-1">{{ $event->title }}</h3>
                <p class="text-xs text-gray-500 mb-3">{{ $event->community->name }}</p>
                <p class="text-sm text-gray-600 mb-3">{{ Str::limit($event->description, 100) }}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>{{ $event->start_datetime->format('d M Y H:i') }}</span>
                    @if($event->isPaid())
                        <span class="font-semibold text-emerald-600">Rp {{ number_format($event->price) }}</span>
                    @else
                        <span class="font-semibold text-emerald-600">Free</span>
                    @endif
                </div>
            </a>
        @endforeach
    </div>
    <div class="mt-6">{{ $events->links() }}</div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">📅</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Event</h3>
        <p class="text-gray-500 text-sm">Belum ada event yang tersedia saat ini.</p>
    </div>
@endif
@endsection
