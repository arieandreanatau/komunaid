@props([
    'variant' => 'full',   // 'full' | 'icon' | 'text'
    'class' => 'h-9 w-auto',
    'alt' => 'KomunaID — Connect, Community, Grow',
])

@php
    $logoFull = asset('assets/brand/komunaid-logo-full.png');
    $logoIcon = asset('assets/brand/komunaid-logo-icon.png');
@endphp

@if ($variant === 'icon')
    <img src="{{ $logoIcon }}" alt="{{ $alt }}" {{ $attributes->merge(['class' => $class]) }} loading="eager" decoding="async">
@elseif ($variant === 'text')
    <span {{ $attributes->merge(['class' => $class . ' inline-flex items-baseline font-extrabold tracking-tight']) }}>
        <span style="color:#0A2A66">Komuna</span><span style="color:#00B8A9">ID</span>
    </span>
@else
    <img src="{{ $logoFull }}" alt="{{ $alt }}" {{ $attributes->merge(['class' => $class]) }} loading="eager" decoding="async" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\'inline-flex items-baseline font-extrabold tracking-tight '+@json($class)+'\'><span style=\'color:#0A2A66\'>Komuna</span><span style=\'color:#00B8A9\'>ID</span></span>');">
@endif
