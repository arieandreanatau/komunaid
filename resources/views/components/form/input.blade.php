@props([
    'name',
    'label' => null,
    'type' => 'text',
    'value' => null,
    'placeholder' => null,
    'required' => false,
    'error' => null,
    'help' => null,
])

@php
    $id = $attributes->get('id', $name);
    $hasError = $error || $errors->has($name);
    $inputClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm';
    if ($hasError) {
        $inputClasses = str_replace('border-gray-300', 'border-red-300', $inputClasses);
    }
@endphp

<div class="mb-4">
    @if($label)
        <label for="{{ $id }}" class="block text-sm font-medium text-gray-700 mb-1">
            {{ $label }}
            @if($required)<span class="text-red-500">*</span>@endif
        </label>
    @endif

    <input
        type="{{ $type }}"
        name="{{ $name }}"
        id="{{ $id }}"
        value="{{ old($name, $value) }}"
        placeholder="{{ $placeholder }}"
        {{ $required ? 'required' : '' }}
        {{ $attributes->merge(['class' => $inputClasses]) }}
    >

    @if($help && !$hasError)
        <p class="mt-1 text-xs text-gray-500">{{ $help }}</p>
    @endif

    @if($hasError)
        <p class="mt-1 text-xs text-red-600">{{ $error ?? $errors->first($name) }}</p>
    @endif
</div>
