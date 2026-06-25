@php
    $count = $count ?? 0;
@endphp

@if($count > 0)
    <span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#25B9F2] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
        {{ $count > 99 ? '99+' : $count }}
    </span>
@endif
