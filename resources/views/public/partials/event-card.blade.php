<a href="{{ route('events.show', $event->slug) }}" class="bg-white rounded-2xl border border-komuna-border-soft overflow-hidden hover:shadow-md transition group">
    @if($event->banner_path)
        <div class="h-40 overflow-hidden">
            <img src="{{ asset('storage/' . $event->banner_path) }}" alt="{{ $event->title }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
        </div>
    @else
        <div class="h-40 bg-gradient-to-br from-komuna-coral/10 to-komuna-coral/5 flex items-center justify-center">
            <svg class="w-12 h-12 text-komuna-coral/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
    @endif
    <div class="p-5">
        <div class="flex flex-wrap items-center gap-2 mb-2">
            @if($event->event_type === 'free')
                <span class="text-xs font-semibold text-komuna-success bg-komuna-success-soft px-2 py-0.5 rounded-full">Gratis</span>
            @elseif($event->event_type === 'paid')
                <span class="text-xs font-semibold text-komuna-coral bg-komuna-coral-soft px-2 py-0.5 rounded-full">Berbayar</span>
            @elseif($event->event_type === 'charity')
                <span class="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">Charity</span>
            @endif
            @if($event->is_open_volunteer)
                <span class="text-xs font-semibold text-komuna-blue bg-komuna-light px-2 py-0.5 rounded-full">Volunteer</span>
            @endif
        </div>
        <h3 class="font-bold text-komuna-text group-hover:text-komuna-coral transition mb-2 line-clamp-2 text-sm">{{ $event->title }}</h3>
        @if($event->community)
            <p class="text-xs text-komuna-muted mb-3">{{ $event->community->name }}</p>
        @endif
        <div class="space-y-1.5 text-xs text-komuna-light-text">
            <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {{ $event->start_datetime ? $event->start_datetime->format('d M Y') : 'TBA' }}
            </div>
            <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {{ $event->location_type === 'online' ? 'Online' : ($event->location_name ?? $event->location_address ?? 'TBA') }}
            </div>
        </div>
    </div>
</a>