@props(['size' => 'md', 'dark' => false])

@php
    $logoPath = null;
    $paths = [
        'public/images/logo.png',
        'public/images/komunaid-logo.png',
        'public/logo.png',
        'public/logo/komunaid-logo.png',
        'storage/app/public/logo/komunaid-logo.png',
    ];
    foreach ($paths as $p) {
        if (file_exists(public_path($p))) {
            $logoPath = '/' . $p;
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
