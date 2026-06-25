@props(['type' => 'success', 'message' => ''])

@php
    $styles = match($type) {
        'success' => 'bg-komuna-success-soft border-komuna-success text-komuna-success',
        'error', 'danger' => 'bg-komuna-danger-soft border-komuna-danger text-komuna-danger',
        'warning' => 'bg-komuna-warning-soft border-komuna-warning text-komuna-warning',
        'info' => 'bg-komuna-info-soft border-komuna-info text-komuna-info',
        default => 'bg-komuna-success-soft border-komuna-success text-komuna-success',
    };

    $icon = match($type) {
        'success' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        'error', 'danger' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>',
        'warning' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>',
        'info' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        default => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    };
@endphp

@if($message)
    <div class="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium {{ $styles }}" role="alert">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{!! $icon !!}</svg>
        <span>{{ $message }}</span>
    </div>
@endif
