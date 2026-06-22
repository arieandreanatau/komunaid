@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <a href="{{ route('events.show', $event) }}" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">&larr; Kembali ke Event</a>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{{ $chat->title }}</h1>
        <p class="text-gray-600">{{ $event->title }} &middot; Oleh {{ $chat->creator->name }}</p>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <div class="flex items-center gap-2 mb-3">
        @if($chat->is_pinned)
            <span class="text-yellow-500">📌</span>
        @endif
        <h2 class="text-lg font-semibold text-gray-900">{{ $chat->title }}</h2>
    </div>
    <p class="text-sm text-gray-700">{{ $chat->message }}</p>
    <p class="text-xs text-gray-500 mt-3">{{ $chat->created_at->format('d M Y H:i') }}</p>
</div>

<div class="space-y-3 mb-6">
    @forelse($chat->threads as $thread)
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p class="text-sm text-gray-700">{{ $thread->message }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ $thread->creator->name }} &middot; {{ $thread->created_at->diffForHumans() }}</p>
        </div>
    @empty
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <p class="text-gray-500 text-sm">Belum ada balasan.</p>
        </div>
    @endforelse
</div>

@if($isMember || ($event->community && $event->community->isOwnedBy(auth()->user())))
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-900 mb-3">Balas</h3>
        <form action="{{ route('member.events.chat.reply', [$event, $chat]) }}" method="POST" class="space-y-3">
            @csrf
            <textarea name="message" rows="3" required placeholder="Tulis balasan..." class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">{{ old('message') }}</textarea>
            <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Kirim Balasan</button>
        </form>
    </div>
@else
    <div class="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
        <p class="text-gray-500 text-sm">Anda harus menjadi anggota komunitas untuk membalas.</p>
    </div>
@endif
@endsection
