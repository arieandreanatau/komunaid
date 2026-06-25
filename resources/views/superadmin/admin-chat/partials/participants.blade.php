@php
    $conversation = $conversation ?? null;
    $canManage = $canManage ?? false;
@endphp

@if($conversation)
    @php
        $activeParticipants = $conversation->participants->whereNull('deleted_at');
    @endphp
    <div class="flex flex-wrap gap-2">
        @foreach($activeParticipants as $participant)
            <div class="flex items-center gap-2 bg-[#EEF7FF] border border-[#E2E8F0] rounded-full px-3 py-1.5">
                <div class="w-6 h-6 bg-[#0B2D89] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {{ strtoupper(substr($participant->user->name ?? 'U', 0, 1)) }}
                </div>
                <span class="text-xs font-medium text-[#0F172A]">{{ e($participant->user->name ?? 'Unknown') }}</span>
                @if($participant->role === 'owner')
                    <span class="text-[10px] bg-[#16A34A]/10 text-[#16A34A] px-1.5 py-0.5 rounded-full font-medium">Owner</span>
                @endif
                @if($canManage && $participant->user_id !== auth()->id())
                    <form action="{{ route('superadmin.admin-chat.participants.remove', [$conversation, $participant]) }}"
                          method="POST"
                          onsubmit="return confirm('Yakin ingin menghapus {{ e($participant->user->name ?? 'user') }} dari percakapan?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="text-[#DC2626] hover:text-[#DC2626]/80 ml-1" title="Hapus peserta">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </form>
                @endif
            </div>
        @endforeach
    </div>
@endif
