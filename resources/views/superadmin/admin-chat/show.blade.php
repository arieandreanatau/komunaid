@extends('layouts.admin')

@section('content')
<div class="max-w-5xl mx-auto flex flex-col" style="height: calc(100vh - 120px);">
    {{-- Header --}}
    <div class="bg-white border border-[#E2E8F0] rounded-t-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
            <a href="{{ route('superadmin.admin-chat.index') }}" class="text-[#64748B] hover:text-[#0F172A] transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
            </a>
            <div>
                <h1 class="text-lg font-bold text-[#0F172A]">{{ e($conversation->title ?: 'Percakapan Admin') }}</h1>
                <p class="text-xs text-[#64748B]">
                    {{ $conversation->participants->whereNull('deleted_at')->count() }} peserta
                    @if($conversation->type === 'group')
                        &middot; Group
                    @endif
                    &middot;
                    @if($conversation->status === 'active')
                        <span class="text-[#16A34A] font-medium">Aktif</span>
                    @else
                        <span class="text-[#F59E0B] font-medium">Diarsipkan</span>
                    @endif
                </p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            {{-- Archive/Unarchive --}}
            @php
                $myParticipant = $conversation->participants->where('user_id', auth()->id())->whereNull('deleted_at')->first();
                $isArchived = $myParticipant && $myParticipant->archived_at;
            @endphp
            @if($isArchived)
                <form action="{{ route('superadmin.admin-chat.unarchive', $conversation) }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" class="text-xs bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20 px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                        </svg>
                        Pulihkan
                    </button>
                </form>
            @else
                <form action="{{ route('superadmin.admin-chat.archive', $conversation) }}" method="POST" class="inline"
                      onsubmit="return confirm('Yakin ingin mengarsipkan percakapan ini?')">
                    @csrf
                    <button type="submit" class="text-xs bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                        </svg>
                        Arsipkan
                    </button>
                </form>
            @endif

            {{-- Add Participant --}}
            @if($canManage && $conversation->status === 'active')
                <div x-data="{ show: false }" class="relative">
                    <button @click="show = !show" class="text-xs bg-[#EEF7FF] text-[#126BFF] hover:bg-[#126BFF]/10 px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Tambah Peserta
                    </button>
                    <div x-show="show" @click.away="show = false" x-cloak
                         class="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-10 p-3">
                        @if($allAdmins->count() > 0)
                            <p class="text-xs text-[#64748B] mb-2 font-medium">Pilih admin:</p>
                            <div class="space-y-1 max-h-48 overflow-y-auto">
                                @foreach($allAdmins as $admin)
                                    <form action="{{ route('superadmin.admin-chat.participants.add', $conversation) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="user_id" value="{{ $admin->id }}">
                                        <button type="submit" class="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#EEF7FF] transition text-left">
                                            <div class="w-7 h-7 bg-[#0B2D89] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                                {{ strtoupper(substr($admin->name, 0, 1)) }}
                                            </div>
                                            <div class="min-w-0">
                                                <p class="text-xs font-medium text-[#0F172A] truncate">{{ e($admin->name) }}</p>
                                            </div>
                                        </button>
                                    </form>
                                @endforeach
                            </div>
                        @else
                            <p class="text-xs text-[#64748B]">Tidak ada admin lain tersedia.</p>
                        @endif
                    </div>
                </div>
            @endif
        </div>
    </div>

    {{-- Participants --}}
    <div class="bg-white border-x border-[#E2E8F0] px-6 py-3 border-b">
        @include('superadmin.admin-chat.partials.participants', [
            'conversation' => $conversation,
            'canManage' => $canManage,
        ])
    </div>

    {{-- Messages --}}
    <div class="flex-1 overflow-y-auto bg-[#F8FAFC] border-x border-[#E2E8F0] px-6 py-4" id="chat-messages">
        @if($messages->count() > 0)
            @foreach($messages as $message)
                @include('superadmin.admin-chat.partials.message-bubble', [
                    'message' => $message,
                    'isOwn' => $message->sender_id === auth()->id(),
                ])
            @endforeach
        @else
            @include('superadmin.admin-chat.partials.empty-state', [
                'title' => 'Belum ada pesan',
                'description' => 'Kirim pesan pertama untuk memulai percakapan.',
            ])
        @endif
    </div>

    {{-- Pagination for messages --}}
    @if($messages->hasPages())
        <div class="bg-white border-x border-[#E2E8F0] px-6 py-2">
            {{ $messages->links() }}
        </div>
    @endif

    {{-- Composer --}}
    <div class="rounded-b-xl border border-[#E2E8F0] border-t-0">
        @include('superadmin.admin-chat.partials.composer', [
            'conversation' => $conversation,
            'disabled' => $conversation->status !== 'active',
        ])
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
</script>
@endsection
