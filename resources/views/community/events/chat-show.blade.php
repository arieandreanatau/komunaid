@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ $chat->title }}</h1>
        <p class="text-gray-600">{{ $event->title }} &middot; Oleh {{ $chat->creator->name }}</p>
    </div>
    <a href="{{ route('community.events.chats.index', $event) }}" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Kembali</a>
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

<h3 class="text-lg font-semibold text-gray-900 mb-4">Threads ({{ $chat->threads->count() }})</h3>

@if($chat->threads->count() > 0)
    <div class="space-y-3 mb-6">
        @foreach($chat->threads as $thread)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 {{ $thread->status === 'pending' ? 'border-l-4 border-yellow-400' : ($thread->status === 'rejected' ? 'border-l-4 border-red-400' : '') }}">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm text-gray-700">{{ $thread->message }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ $thread->creator->name }} &middot; {{ $thread->created_at->diffForHumans() }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium
                            @if($thread->status === 'approved') bg-green-100 text-green-800
                            @elseif($thread->status === 'pending') bg-yellow-100 text-yellow-800
                            @else bg-red-100 text-red-800
                            @endif">
                            {{ ucfirst($thread->status) }}
                        </span>
                        @if($thread->status === 'pending')
                            <form action="{{ route('community.events.chats.approve-thread', [$event, $chat, $thread]) }}" method="POST" class="inline">
                                @csrf
                                <button type="submit" class="text-green-600 hover:text-green-800 text-xs font-medium">Approve</button>
                            </form>
                            <form action="{{ route('community.events.chats.reject-thread', [$event, $chat, $thread]) }}" method="POST" class="inline">
                                @csrf
                                <button type="submit" class="text-red-600 hover:text-red-800 text-xs font-medium">Reject</button>
                            </form>
                        @endif
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6">
        <p class="text-gray-500 text-sm">Belum ada thread.</p>
    </div>
@endif
@endsection
