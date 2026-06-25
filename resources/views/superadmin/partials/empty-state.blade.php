@props(['title' => 'Tidak ada data', 'description' => '', 'icon' => 'empty', 'actionUrl' => '', 'actionLabel' => ''])

<div class="text-center py-12">
    <svg class="mx-auto h-12 w-12 text-[#64748B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
    </svg>
    <h3 class="mt-2 text-sm font-medium text-[#0F172A]">{{ $title }}</h3>
    @if($description)
        <p class="mt-1 text-sm text-[#64748B]">{{ $description }}</p>
    @endif
    @if($actionUrl)
        <div class="mt-4">
            <a href="{{ $actionUrl }}" class="inline-flex items-center px-4 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">
                {{ $actionLabel }}
            </a>
        </div>
    @endif
</div>
