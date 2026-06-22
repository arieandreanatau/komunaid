@extends('layouts.app')
@section('title', 'Posts - ' . $community->name)
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <a href="{{ route('community-owner.communities.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Posts: {{ $community->name }}</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="bg-white rounded-xl border p-6 mb-6">
        <h2 class="font-bold text-navy mb-3">Buat Post Baru</h2>
        <form action="{{ route('community-owner.communities.posts.store', $community->id) }}" method="POST">
            @csrf
            <input type="text" name="title" placeholder="Judul (opsional)" value="{{ old('title') }}" class="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue">
            <textarea name="content" rows="3" placeholder="Tulis sesuatu..." required class="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue">{{ old('content') }}</textarea>
            <div class="flex items-center gap-4">
                <select name="type" class="px-4 py-2 border rounded-lg text-sm">
                    <option value="general">General</option>
                    <option value="announcement">Announcement</option>
                    <option value="discussion">Discussion</option>
                </select>
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_pinned" value="1" class="rounded"> Pin
                </label>
                <button type="submit" class="bg-blue hover:bg-navy text-white px-4 py-2 rounded-lg text-sm transition">Post</button>
            </div>
        </form>
    </div>
    <div class="space-y-4">
        @forelse($posts as $post)
            <div class="bg-white rounded-xl border p-4">
                <div class="flex justify-between items-start">
                    <div>
                        @if($post->is_pinned)
                            <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded mb-1 inline-block">📌 Pinned</span>
                        @endif
                        @if($post->title)
                            <h3 class="font-bold text-navy">{{ $post->title }}</h3>
                        @endif
                        <p class="text-sm text-gray-600 mt-1">{{ $post->content }}</p>
                        <div class="text-xs text-gray-400 mt-2">Oleh {{ $post->user->name }} &bull; {{ $post->created_at->diffForHumans() }}</div>
                    </div>
                    <form action="{{ route('community-owner.communities.posts.destroy', [$community->id, $post->id]) }}" method="POST" onsubmit="return confirm('Hapus post?')">
                        @csrf @method('DELETE')
                        <button class="text-red-500 text-xs hover:underline">Hapus</button>
                    </form>
                </div>
            </div>
        @empty
            <div class="text-center py-8 text-gray-400">Belum ada post.</div>
        @endforelse
    </div>
    <div class="mt-4">{{ $posts->links() }}</div>
</div>
@endsection
