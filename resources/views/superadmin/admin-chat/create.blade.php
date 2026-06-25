@extends('layouts.admin')

@section('content')
<div class="max-w-3xl mx-auto">
    {{-- Header --}}
    <div class="flex items-center gap-3 mb-6">
        <a href="{{ route('superadmin.admin-chat.index') }}" class="text-[#64748B] hover:text-[#0F172A] transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
        </a>
        <div>
            <h1 class="text-2xl font-bold text-[#0F172A]">Percakapan Baru</h1>
            <p class="text-sm text-[#64748B] mt-1">Buat percakapan dengan admin platform lainnya</p>
        </div>
    </div>

    {{-- Form --}}
    <form action="{{ route('superadmin.admin-chat.store') }}" method="POST" class="space-y-6">
        @csrf

        {{-- Title --}}
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-6">
            <label for="title" class="block text-sm font-semibold text-[#0F172A] mb-2">Judul Percakapan <span class="text-[#64748B] font-normal">(opsional)</span></label>
            <input type="text" id="title" name="title" value="{{ old('title') }}"
                   placeholder="Contoh: Koordinasi Event Nasional"
                   class="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF]"
                   maxlength="255">
            @error('title')
                <p class="text-xs text-[#DC2626] mt-1">{{ $message }}</p>
            @enderror
        </div>

        {{-- Participants --}}
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-6">
            <label class="block text-sm font-semibold text-[#0F172A] mb-2">Peserta <span class="text-[#DC2626]">*</span></label>
            <p class="text-xs text-[#64748B] mb-3">Pilih admin platform yang ingin diajak bicara. Anda otomatis menjadi peserta.</p>

            @if($users->count() > 0)
                <div class="space-y-2 max-h-60 overflow-y-auto border border-[#E2E8F0] rounded-lg p-3">
                    @foreach($users as $user)
                        <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-[#EEF7FF] cursor-pointer transition">
                            <input type="checkbox" name="participant_ids[]" value="{{ $user->id }}"
                                   {{ in_array($user->id, old('participant_ids', [])) ? 'checked' : '' }}
                                   class="w-4 h-4 text-[#126BFF] border-[#E2E8F0] rounded focus:ring-[#126BFF]/30">
                            <div class="w-8 h-8 bg-[#0B2D89] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-[#0F172A]">{{ e($user->name) }}</p>
                                <p class="text-xs text-[#64748B]">{{ e($user->email) }}</p>
                            </div>
                            @php
                                $roles = $user->roles->pluck('name')->implode(', ');
                            @endphp
                            <span class="text-[10px] bg-[#126BFF]/10 text-[#126BFF] px-2 py-0.5 rounded-full font-medium">{{ e($roles) }}</span>
                        </label>
                    @endforeach
                </div>
            @else
                <p class="text-sm text-[#64748B]">Tidak ada admin platform lain yang tersedia.</p>
            @endif

            @error('participant_ids')
                <p class="text-xs text-[#DC2626] mt-1">{{ $message }}</p>
            @enderror
            @error('participant_ids.*')
                <p class="text-xs text-[#DC2626] mt-1">{{ $message }}</p>
            @enderror
        </div>

        {{-- First Message --}}
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-6">
            <label for="first_message" class="block text-sm font-semibold text-[#0F172A] mb-2">Pesan Pertama <span class="text-[#DC2626]">*</span></label>
            <textarea id="first_message" name="first_message" rows="4"
                      placeholder="Tulis pesan pertama..."
                      class="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] resize-none"
                      required
                      maxlength="5000">{{ old('first_message') }}</textarea>
            <div class="flex justify-between mt-1">
                @error('first_message')
                    <p class="text-xs text-[#DC2626]">{{ $message }}</p>
                @else
                    <span></span>
                @enderror
                <span class="text-xs text-[#64748B]">{{ strlen(old('first_message', '')) }}/5000</span>
            </div>
        </div>

        {{-- Submit --}}
        <div class="flex items-center gap-3">
            <a href="{{ route('superadmin.admin-chat.index') }}" class="border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#0F172A] px-5 py-2.5 rounded-lg text-sm font-semibold transition">
                Batal
            </a>
            <button type="submit" class="bg-[#126BFF] hover:bg-[#0B2D89] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition">
                Buat Percakapan
            </button>
        </div>
    </form>
</div>
@endsection
