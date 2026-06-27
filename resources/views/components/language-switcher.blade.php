@php
    $current = app()->getLocale();
    $available = ['id' => 'Bahasa Indonesia', 'en' => 'English'];
@endphp

<div class="relative inline-block text-left">
    <button type="button" class="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" onclick="this.nextElementSibling.classList.toggle('hidden')">
        <span class="mr-1">{{ $available[$current] ?? $current }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
    </button>
    <div class="hidden absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
        @foreach($available as $code => $label)
            @if($code !== $current)
                <a href="{{ route('language.switch', $code) }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{{ $label }}</a>
            @endif
        @endforeach
    </div>
</div>
