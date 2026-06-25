@php
    $conversation = $conversation ?? null;
    $disabled = $disabled ?? false;
@endphp

@if($conversation && !$disabled)
    <div class="border-t border-[#E2E8F0] bg-white p-4">
        <form action="{{ route('superadmin.admin-chat.messages.store', $conversation) }}" method="POST" class="flex items-end gap-3">
            @csrf
            <div class="flex-1">
                <textarea name="body"
                          rows="2"
                          placeholder="Ketik pesan..."
                          class="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] resize-none transition"
                          required
                          maxlength="5000"
                          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();this.closest('form').submit();}"></textarea>
                @error('body')
                    <p class="text-xs text-[#DC2626] mt-1">{{ $message }}</p>
                @enderror
            </div>
            <button type="submit"
                    class="flex-shrink-0 bg-[#126BFF] hover:bg-[#0B2D89] text-white rounded-xl px-5 py-3 text-sm font-semibold transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Kirim
            </button>
        </form>
    </div>
@elseif($disabled)
    <div class="border-t border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
        <p class="text-xs text-[#64748B]">Percakapan ini sudah diarsipkan. Pesan baru tidak bisa dikirim.</p>
    </div>
@endif
