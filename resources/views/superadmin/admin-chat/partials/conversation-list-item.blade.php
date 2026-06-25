@php
    $conversation = $conversation ?? null;
    $unreadCounts = $unreadCounts ?? [];
@endphp

@if($conversation)
    @php
        $lastMessage = $conversation->latestMessage;
        $unreadCount = $unreadCounts[$conversation->id] ?? 0;
        $participantNames = $conversation->participants->whereNull('deleted_at')->pluck('user.name')->filter()->implode(', ');
        $isArchived = $conversation->participants->where('user_id', auth()->id())->first()->archived_at ?? null;
    @endphp

    <a href="{{ route('superadmin.admin-chat.show', $conversation) }}"
       class="block p-4 border border-[#E2E8F0] rounded-xl hover:border-[#126BFF]/30 hover:bg-white/80 transition {{ $unreadCount > 0 ? 'bg-[#EEF7FF]' : 'bg-white' }}">
        <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-sm font-semibold text-[#0F172A] truncate">
                        {{ e($conversation->title ?: 'Percakapan Admin') }}
                    </h3>
                    @if($conversation->type === 'group')
                        <span class="text-[10px] bg-[#126BFF]/10 text-[#126BFF] px-1.5 py-0.5 rounded-full font-medium">Group</span>
                    @endif
                    @if($isArchived)
                        <span class="text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] px-1.5 py-0.5 rounded-full font-medium">Arsip</span>
                    @endif
                </div>
                <p class="text-xs text-[#64748B] mb-1.5 truncate">{{ e(Str::limit($participantNames, 60)) }}</p>
                @if($lastMessage)
                    <p class="text-xs text-[#64748B] truncate">
                        @if($lastMessage->message_type === 'system')
                            <span class="italic">{{ e(Str::limit($lastMessage->body, 60)) }}</span>
                        @else
                            <span class="font-medium text-[#0F172A]">{{ e($lastMessage->sender->name ?? 'Unknown') }}:</span>
                            {{ e(Str::limit($lastMessage->body, 60)) }}
                        @endif
                    </p>
                @else
                    <p class="text-xs text-[#64748B] italic">Belum ada pesan</p>
                @endif
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
                @if($lastMessage)
                    <span class="text-[10px] text-[#64748B]">{{ $lastMessage->created_at->diffForHumans() }}</span>
                @endif
                @if($unreadCount > 0)
                    <span class="min-w-[18px] h-[18px] bg-[#25B9F2] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {{ $unreadCount > 99 ? '99+' : $unreadCount }}
                    </span>
                @endif
            </div>
        </div>
    </a>
@endif
