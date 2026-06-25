@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <a href="{{ route('events.show', $event) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">&larr; Kembali ke Event</a>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text mt-2">{{ $chat->title }}</h1>
        <p class="text-komuna-muted">{{ $event->title }} &middot; Oleh {{ $chat->creator->name }}</p>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 mb-6">
    <div class="flex items-center gap-2 mb-3">
        @if($chat->is_pinned)
            <span class="text-yellow-500">📌</span>
        @endif
        <h2 class="text-lg font-semibold text-komuna-text">{{ $chat->title }}</h2>
    </div>
    <p class="text-sm text-komuna-text">{{ $chat->message }}</p>
    <p class="text-xs text-komuna-muted mt-3">{{ $chat->created_at->format('d M Y H:i') }}</p>
</div>

<div class="space-y-3 mb-6">
    @forelse($chat->threads as $thread)
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4">
            <p class="text-sm text-komuna-text">{{ $thread->message }}</p>
            <p class="text-xs text-komuna-muted mt-2">{{ $thread->creator->name }} &middot; {{ $thread->created_at->diffForHumans() }}</p>
        </div>
    @empty
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 text-center">
            <p class="text-komuna-muted text-sm">Belum ada balasan.</p>
        </div>
    @endforelse
</div>

@if($isMember || ($event->community && $event->community->isOwnedBy(auth()->user())))
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
        <h3 class="font-semibold text-komuna-text mb-3">Balas</h3>
        <form action="{{ route('member.events.chat.reply', [$event, $chat]) }}" method="POST" class="space-y-3">
            @csrf
            <textarea name="message" rows="3" required placeholder="Tulis balasan..." class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('message') }}</textarea>
            <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Kirim Balasan</button>
        </form>
    </div>
@else
    <div class="bg-komuna-surface rounded-2xl border border-komuna-border p-5 text-center">
        <p class="text-komuna-muted text-sm">Anda harus menjadi anggota komunitas untuk membalas.</p>
    </div>
@endif
@endsection
