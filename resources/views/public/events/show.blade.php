@extends('layouts.public')

@section('title', $event->title . ' — KomunaID')
@section('meta_description')
<meta name="description" content="{{ Str::limit(strip_tags($event->description), 160) }}">
@endsection

@section('content')
<article class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <a href="{{ route('events.index') }}" class="inline-flex items-center gap-1 text-sm text-komuna-blue hover:text-komuna-navy mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali ke Events
    </a>

    @if($event->banner_path)
        <div class="rounded-2xl overflow-hidden mb-8">
            <img src="{{ asset('storage/' . $event->banner_path) }}" alt="{{ $event->title }}" class="w-full h-64 sm:h-80 object-cover">
        </div>
    @endif

    <div class="flex items-center gap-2 mb-4 flex-wrap">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold
            @if($event->event_type === 'free') bg-komuna-success-soft text-komuna-success
            @elseif($event->event_type === 'paid') bg-komuna-warning-soft text-komuna-warning
            @elseif($event->event_type === 'charity') bg-pink-50 text-pink-600
            @elseif($event->event_type === 'volunteer') bg-teal-50 text-teal-600
            @else bg-komuna-light text-komuna-blue
            @endif">
            {{ ucfirst($event->event_type) }}
        </span>
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-komuna-border-soft text-komuna-muted">{{ ucfirst($event->location_type) }}</span>
        @if($event->is_open_volunteer)
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold text-teal-700 bg-komuna-success-soft">Open Volunteer</span>
        @endif
        @if($event->is_open_donation)
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold text-orange-700 bg-komuna-warning-soft">Charity / Donasi</span>
        @endif
        @if($event->approval_status === 'approved')
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold text-komuna-success bg-komuna-success-soft">Open Registration</span>
        @endif
    </div>

    <h1 class="text-3xl sm:text-4xl font-extrabold text-komuna-text mb-4">{{ $event->title }}</h1>

    @if($event->community)
        <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                @if($event->community->logo)
                    <img src="{{ asset('storage/' . $event->community->logo) }}" alt="" class="w-full h-full object-cover">
                @else
                    {{ substr($event->community->name, 0, 1) }}
                @endif
            </div>
            <div>
                <p class="font-semibold text-komuna-text text-sm">{{ $event->community->name }}</p>
                <p class="text-xs text-komuna-muted">{{ $event->community->city ?? '' }}</p>
            </div>
        </div>
    @endif
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div class="lg:col-span-2">
            <div class="prose prose-lg max-w-none prose-headings:text-komuna-navy prose-a:text-komuna-blue">
                {!! $event->description !!}
            </div>
        </div>
        <div>
            <div class="bg-white rounded-2xl border border-komuna-border-soft p-6 sticky top-24">
                <h3 class="font-bold text-komuna-text mb-4">Detail Event</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-komuna-light-text mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <div>
                            <p class="text-komuna-muted">Tanggal Mulai</p>
                            <p class="font-medium text-komuna-text">{{ $event->start_datetime ? $event->start_datetime->format('d M Y, H:i') : 'TBA' }}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-komuna-light-text mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <div>
                            <p class="text-komuna-muted">Tanggal Selesai</p>
                            <p class="font-medium text-komuna-text">{{ $event->end_datetime ? $event->end_datetime->format('d M Y, H:i') : 'TBA' }}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-komuna-light-text mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <div>
                            <p class="text-komuna-muted">Lokasi</p>
                            @if($event->location_type === 'online' && $event->location_url)
                                <a href="{{ $event->location_url }}" target="_blank" class="font-medium text-komuna-blue hover:underline">Online (Link)</a>
                            @else
                                <p class="font-medium text-komuna-text">{{ $event->location_name ?? $event->location_address ?? 'TBA' }}</p>
                            @endif
                        </div>
                    </div>
                    <div class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-komuna-light-text mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <div>
                            <p class="text-komuna-muted">Harga</p>
                            @if($event->isPaid())
                                <p class="font-medium text-komuna-text">Rp {{ number_format($event->price, 0, ',', '.') }}</p>
                            @else
                                <p class="font-medium text-komuna-success">Gratis</p>
                            @endif
                        </div>
                    </div>
                    @if($event->capacity)
                        <div class="flex items-start gap-2">
                            <svg class="w-4 h-4 text-komuna-light-text mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            <div>
                                <p class="text-komuna-muted">Kapasitas</p>
                                <p class="font-medium text-komuna-text">{{ $event->remaining_capacity }} / {{ $event->capacity }} orang</p>
                            </div>
                        </div>
                    @endif
                </div>

                @guest
                    <div class="mt-6 space-y-2">
                        @if($event->isOpenForRegistration())
                            <a href="{{ route('login') }}" class="block w-full bg-komuna-blue text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition text-sm">Login untuk Daftar</a>
                        @endif
                        @if($event->is_open_volunteer)
                            <a href="{{ route('login') }}" class="block w-full bg-teal-600 text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition text-sm">Login untuk Volunteer</a>
                        @endif
                        @if($event->is_open_donation)
                            <a href="{{ route('login') }}" class="block w-full bg-orange-600 text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition text-sm">Login untuk Donasi</a>
                        @endif
                    </div>
                @else
                    <div class="mt-6 space-y-2">
                        @if($event->isOpenForRegistration())
                            <a href="{{ route('member.events.register', $event) }}" class="block w-full bg-komuna-blue text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition text-sm">Daftar Event</a>
                        @endif
                        @if($event->is_open_volunteer)
                            <a href="{{ route('member.events.volunteer.apply', $event) }}" class="block w-full bg-teal-600 text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition text-sm">Apply Volunteer</a>
                        @endif
                        @if($event->is_open_donation)
                            <a href="{{ route('member.events.donate', $event) }}" class="block w-full bg-orange-600 text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition text-sm">Donasi Sekarang</a>
                        @endif
                    </div>
                @endguest
            </div>
        </div>
    </div>
</article>
@endsection
