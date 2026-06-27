@props([
    'striped' => true,
    'hoverable' => true,
    'empty' => null,
])

<div class="overflow-x-auto">
    <table {{ $attributes->merge(['class' => 'min-w-full divide-y divide-gray-200']) }}>
        @if(isset($head))
            <thead class="bg-gray-50">
                <tr>
                    {{ $head }}
                </tr>
            </thead>
        @endif
        <tbody class="bg-white {{ $striped ? 'divide-y divide-gray-200' : '' }}">
            @if($slot->isEmpty() && $empty)
                <tr>
                    <td colspan="100" class="px-6 py-12 text-center text-gray-500">
                        {{ $empty }}
                    </td>
                </tr>
            @else
                {{ $slot }}
            @endif
        </tbody>
    </table>
</div>
