@php
    $title = $title ?? 'Belum ada percakapan';
    $description = $description ?? 'Mulai percakapan baru dengan admin platform lainnya.';
    $actionLabel = $actionLabel ?? null;
    $actionUrl = $actionUrl ?? null;
@endphp

<div class="flex flex-col items-center justify-center py-16 px-4">
    <div class="w-20 h-20 bg-[#EEF7FF] rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-[#25B9F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
    </div>
    <h3 class="text-lg font-semibold text-[#0F172A] mb-1">{{ $title }}</h3>
    <p class="text-sm text-[#64748B] text-center max-w-sm mb-4">{{ $description }}</p>
    @if($actionLabel && $actionUrl)
        <a href="{{ $actionUrl }}"
           class="bg-[#126BFF] hover:bg-[#0B2D89] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition">
            {{ $actionLabel }}
        </a>
    @endif
</div>
