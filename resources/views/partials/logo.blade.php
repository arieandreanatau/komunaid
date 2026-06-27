@props(['size' => 'md', 'dark' => false, 'withTagline' => false])

@php
    $logoPath = null;
    $paths = [
        'assets/brand/komunaid-logo-full.png',
        'images/logo.png',
        'images/komunaid-logo.png',
        'logo.png',
        'logo/komunaid-logo.png',
    ];
    foreach ($paths as $p) {
        if (file_exists(public_path($p))) {
            $logoPath = asset($p);
            break;
        }
    }
    if (!$logoPath && file_exists(storage_path('app/public/logo/komunaid-logo.png'))) {
        $logoPath = asset('storage/logo/komunaid-logo.png');
    }

    $sizes = match($size) {
        'sm' => 'h-7',
        'md' => 'h-9',
        'lg' => 'h-11',
        'xl' => 'h-14',
        'hero' => 'h-18',
        default => 'h-9',
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
    <img src="{{ $logoPath }}" alt="KomunaID Logo" class="{{ $sizes }} w-auto object-contain" loading="lazy">
@else
    <span class="{{ $textSizes }} font-extrabold tracking-tight {{ $dark ? 'text-white' : 'text-komuna-navy' }}">
        Komuna<span class="{{ $dark ? 'text-komuna-cyan' : 'text-komuna-blue' }}">ID</span>
    </span>
@endif

@if($withTagline)
    <span class="block text-xs {{ $dark ? 'text-blue-300' : 'text-komuna-muted' }} mt-0.5 tracking-wide">CONNECT &bull; COMMUNITY &bull; GROW</span>
@endif
