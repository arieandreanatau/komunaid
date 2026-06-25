@props(['action' => '#', 'method' => 'POST', 'title' => 'Konfirmasi', 'message' => 'Apakah Anda yakin?', 'confirmText' => 'Ya, Lanjutkan', 'cancelText' => 'Batal', 'id' => 'confirm-modal'])

<div id="{{ $id }}" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-black/50" onclick="document.getElementById('{{ $id }}').classList.add('hidden')"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block overflow-hidden text-left align-bottom bg-white rounded-xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="px-6 pt-6 pb-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-[#DC2626]/10 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[#0F172A]">{{ $title }}</h3>
                </div>
                <p class="text-sm text-[#64748B]">{{ $message }}</p>
            </div>
            <div class="px-6 pb-6 flex justify-end gap-3">
                <button type="button" onclick="document.getElementById('{{ $id }}').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-[#64748B] bg-komuna-border-soft rounded-lg hover:bg-komuna-border transition">
                    {{ $cancelText }}
                </button>
                <form method="POST" action="{{ $action }}" class="inline">
                    @csrf
                    @if(in_array($method, ['PUT', 'PATCH', 'DELETE']))
                        @method($method)
                    @endif
                    @if(isset($slot))
                        {{ $slot }}
                    @endif
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-lg hover:bg-red-700 transition">
                        {{ $confirmText }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
