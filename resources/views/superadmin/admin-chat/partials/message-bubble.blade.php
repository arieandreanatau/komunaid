@php
    $message = $message ?? null;
    $isOwn = $isOwn ?? false;
@endphp

@if($message)
    @if($message->message_type === 'system')
        <div class="flex justify-center my-3">
            <span class="text-xs text-[#64748B] bg-[#EEF7FF] px-3 py-1.5 rounded-full">
                {{ e($message->body) }}
            </span>
        </div>
    @else
        <div class="flex {{ $isOwn ? 'justify-end' : 'justify-start' }} mb-3">
            <div class="max-w-[75%] lg:max-w-[60%]">
                @if(!$isOwn)
                    <p class="text-[11px] font-semibold text-[#126BFF] mb-1">{{ e($message->sender->name ?? 'Unknown') }}</p>
                @endif
                <div class="{{ $isOwn
                    ? 'bg-gradient-to-br from-[#126BFF] to-[#0B2D89] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A]'
                }} px-4 py-2.5 rounded-2xl {{ $isOwn ? 'rounded-br-md' : 'rounded-bl-md' }}">
                    <p class="text-sm leading-relaxed whitespace-pre-wrap">{!! nl2br(e($message->body)) !!}</p>
                </div>
                <p class="text-[10px] text-[#64748B] mt-1 {{ $isOwn ? 'text-right' : 'text-left' }}">
                    {{ $message->created_at->format('H:i') }}
                    @if($message->edited_at)
                        <span class="italic">(diedit)</span>
                    @endif
                </p>
            </div>
        </div>
    @endif
@endif
