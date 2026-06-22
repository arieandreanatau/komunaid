@extends('layouts.app')
@section('title', 'Chat - ' . $community->name)
@section('content')
<div class="max-w-4xl mx-auto px-4 py-8">
    <a href="{{ route('community-owner.communities.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Chat: {{ $community->name }}</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="bg-white rounded-xl border p-4 mb-4 max-h-96 overflow-y-auto">
        @forelse($messages as $msg)
            <div class="mb-3 {{ $msg->sender_id === auth()->id() ? 'text-right' : '' }}">
                <span class="text-xs text-gray-400">{{ $msg->sender->name }} &bull; {{ $msg->created_at->diffForHumans() }}</span>
                <div class="inline-block {{ $msg->sender_id === auth()->id() ? 'bg-blue text-white' : 'bg-soft-bg text-navy' }} rounded-lg px-4 py-2 text-sm mt-1 max-w-md text-left">
                    {{ $msg->content }}
                </div>
            </div>
        @empty
            <div class="text-center py-8 text-gray-400">Belum ada pesan.</div>
        @endforelse
    </div>
    <form action="{{ route('community-owner.communities.messages.store', $community->id) }}" method="POST" class="flex gap-2">
        @csrf
        <input type="text" name="content" placeholder="Ketik pesan..." required class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
        <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Kirim</button>
    </form>
</div>
@endsection
