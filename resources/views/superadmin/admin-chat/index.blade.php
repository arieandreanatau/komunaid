@extends('layouts.admin')

@section('content')
<div class="max-w-7xl mx-auto">
    {{-- Header --}}
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
            <h1 class="text-2xl font-bold text-[#0F172A]">Admin Chat</h1>
            <p class="text-sm text-[#64748B] mt-1">Percakapan internal antar admin platform</p>
        </div>
        <a href="{{ route('superadmin.admin-chat.create') }}"
           class="bg-[#126BFF] hover:bg-[#0B2D89] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 self-start">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Percakapan Baru
        </a>
    </div>

    {{-- Filters & Search --}}
    <div class="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <form action="{{ route('superadmin.admin-chat.index') }}" method="GET" class="flex-1 flex gap-3">
            <div class="flex-1 relative">
                <input type="text" name="search" value="{{ e($search ?? '') }}"
                       placeholder="Cari percakapan atau pesan..."
                       class="w-full border border-[#E2E8F0] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF]">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <button type="submit" class="bg-[#0B2D89] hover:bg-[#0B2D89]/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
                Cari
            </button>
        </form>
        <div class="flex gap-2">
            <a href="{{ route('superadmin.admin-chat.index') }}"
               class="px-4 py-2.5 rounded-lg text-sm font-medium transition border {{ !$status ? 'bg-[#0B2D89] text-white border-[#0B2D89]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#126BFF]/30' }}">
                Semua
            </a>
            <a href="{{ route('superadmin.admin-chat.index', ['status' => 'active']) }}"
               class="px-4 py-2.5 rounded-lg text-sm font-medium transition border {{ $status === 'active' ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#16A34A]/30' }}">
                Aktif
            </a>
            <a href="{{ route('superadmin.admin-chat.index', ['status' => 'archived']) }}"
               class="px-4 py-2.5 rounded-lg text-sm font-medium transition border {{ $status === 'archived' ? 'bg-[#F59E0B] text-white border-[#F59E0B]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#F59E0B]/30' }}">
                Arsip
            </a>
        </div>
    </div>

    {{-- Conversation List --}}
    @if($conversations->count() > 0)
        <div class="space-y-3">
            @foreach($conversations as $conversation)
                @include('superadmin.admin-chat.partials.conversation-list-item', [
                    'conversation' => $conversation,
                    'unreadCounts' => $unreadCounts,
                ])
            @endforeach
        </div>

        <div class="mt-6">
            {{ $conversations->withQueryString()->links() }}
        </div>
    @else
        @include('superadmin.admin-chat.partials.empty-state', [
            'title' => 'Belum ada percakapan',
            'description' => 'Mulai percakapan baru dengan admin platform lainnya.',
            'actionLabel' => 'Buat Percakapan Baru',
            'actionUrl' => route('superadmin.admin-chat.create'),
        ])
    @endif
</div>
@endsection
