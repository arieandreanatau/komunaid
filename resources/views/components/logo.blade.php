@props(['size' => 'md', 'dark' => false])

@php
    $logoPath = null;
    $paths = [
        'assets/brand/komunaid-logo-full.png',
        'images/logo.png',
        'images/komunaid-logo.png',
        'logo.png',
        'logo/komunaid-logo.png',
        'storage/logo/komunaid-logo.png',
    ];
    foreach ($paths as $p) {
        if (file_exists(public_path($p))) {
            $logoPath = asset($p);
            break;
        }
    }

    $sizes = match($size) {
        'sm' => 'h-8',
        'md' => 'h-10',
        'lg' => 'h-12',
        'xl' => 'h-16',
        'hero' => 'h-20',
        default => 'h-10',
    };

    $textSizes = match($size) {
        'sm' => 'text-lg',
        'md' => 'text-xl',
        'lg' => 'text-2xl',
        'xl' => 'text-3xl',
        'hero' => 'text-4xl',
        default => 'text-xl',
    };
@endphp

@if($logoPath)
    <img src="{{ $logoPath }}" alt="KomunaID" class="{{ $sizes }} w-auto object-contain" loading="lazy">
@else
    <span class="{{ $textSizes }} font-extrabold tracking-tight {{ $dark ? 'text-white' : 'text-komuna-navy' }}">
        Komuna<span class="{{ $dark ? 'text-komuna-cyan' : 'text-komuna-blue' }}">ID</span>
    </span>
@endif
