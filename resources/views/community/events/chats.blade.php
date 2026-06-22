@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Chat / Forum Event</h1>
        <p class="text-gray-600">{{ $event->title }}</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Kembali</a>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <h3 class="font-semibold text-gray-900 mb-4">Buat Chat Utama</h3>
    <form action="{{ route('community.events.chats.store', $event) }}" method="POST" class="space-y-4">
        @csrf
        <div>
            <input type="text" name="title" value="{{ old('title') }}" placeholder="Judul diskusi" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
        </div>
        <div>
            <textarea name="message" rows="3" placeholder="Pesan utama..." required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">{{ old('message') }}</textarea>
        </div>
        <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
                <input type="checkbox" name="is_pinned" value="1" class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500">
                <span class="text-sm text-gray-700">Pin Chat</span>
            </label>
            <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Buat Chat</button>
        </div>
    </form>
</div>

@if($chats->count() > 0)
    <div class="space-y-4">
        @foreach($chats as $chat)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <div class="flex items-center gap-2">
                            @if($chat->is_pinned)
                                <span class="text-yellow-500 text-sm">📌</span>
                            @endif
                            <a href="{{ route('community.events.chats.show', [$event, $chat]) }}" class="font-semibold text-gray-900 hover:text-emerald-600">{{ $chat->title }}</a>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Oleh {{ $chat->creator->name }} &middot; {{ $chat->created_at->diffForHumans() }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <form action="{{ route('community.events.chats.pin', [$event, $chat]) }}" method="POST" class="inline">
                            @csrf
                            <button type="submit" class="text-yellow-600 hover:text-yellow-800 text-sm">{{ $chat->is_pinned ? 'Unpin' : 'Pin' }}</button>
                        </form>
                        <form action="{{ route('community.events.chats.destroy', [$event, $chat]) }}" method="POST" onsubmit="return confirm('Hapus chat ini?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                        </form>
                    </div>
                </div>
                <p class="text-sm text-gray-700 mb-3">{{ $chat->message }}</p>

                <div class="border-t border-gray-100 pt-3 mt-3">
                    <p class="text-xs text-gray-500 mb-2">Threads ({{ $chat->approvedThreads->count() }} approved)</p>
                    @foreach($chat->approvedThreads->take(3) as $thread)
                        <div class="bg-gray-50 rounded-lg p-3 mb-2">
                            <p class="text-sm text-gray-700">{{ $thread->message }}</p>
                            <p class="text-xs text-gray-500 mt-1">{{ $thread->creator->name }} &middot; {{ $thread->created_at->diffForHumans() }}</p>
                        </div>
                    @endforeach
                    @if($chat->approvedThreads->count() > 3)
                        <a href="{{ route('community.events.chats.show', [$event, $chat]) }}" class="text-emerald-600 text-sm font-medium hover:underline">Lihat semua...</a>
                    @endif
                </div>
            </div>
        @endforeach
    </div>
    <div class="mt-6">{{ $chats->links() }}</div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">💬</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Chat</h3>
        <p class="text-gray-500 text-sm">Buat chat utama untuk memulai diskusi.</p>
    </div>
@endif
@endsection
