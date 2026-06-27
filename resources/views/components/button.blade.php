@props([
    'variant' => 'primary',
    'size' => 'md',
    'type' => 'button',
    'href' => null,
    'disabled' => false,
])

@php
    $baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-1';
    $sizeClasses = match($size) {
        'sm' => 'px-2.5 py-1.5 text-xs',
        'lg' => 'px-5 py-3 text-base',
        default => 'px-4 py-2 text-sm',
    };
    $variantClasses = match($variant) {
        'secondary' => 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
        'danger' => 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        'ghost' => 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        'primary' => 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        default => 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    };
    $disabledClasses = $disabled ? 'opacity-50 cursor-not-allowed' : '';
    $classes = trim("$baseClasses $sizeClasses $variantClasses $disabledClasses");
@endphp

@if($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $classes]) }}>
        {{ $slot }}
    </a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $classes]) }} @disabled($disabled)>
        {{ $slot }}
    </button>
@endif
