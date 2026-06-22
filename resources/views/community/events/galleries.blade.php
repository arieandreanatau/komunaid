@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Gallery Event</h1>
        <p class="text-gray-600">{{ $event->title }}</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Kembali</a>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <h3 class="font-semibold text-gray-900 mb-4">Upload Gallery</h3>
    <form action="{{ route('community.events.galleries.store', $event) }}" method="POST" enctype="multipart/form-data" class="space-y-4">
        @csrf
        <div>
            <input type="file" name="images[]" multiple accept="image/*" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            <p class="text-xs text-gray-500 mt-1">Maksimal 10 gambar, 5MB per gambar</p>
        </div>
        <div>
            <input type="text" name="captions[]" placeholder="Caption untuk gambar (opsional)" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
        </div>
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Upload</button>
    </form>
</div>

@if($galleries->count() > 0)
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        @foreach($galleries as $gallery)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                <div class="aspect-square bg-gray-100">
                    <img src="{{ Storage::url($gallery->image_path) }}" alt="{{ $gallery->caption }}" class="w-full h-full object-cover">
                </div>
                <div class="p-3">
                    <p class="text-xs text-gray-500">{{ $gallery->uploader->name }}</p>
                    @if($gallery->caption)
                        <p class="text-sm text-gray-700 mt-1">{{ $gallery->caption }}</p>
                    @endif
                    <form action="{{ route('community.events.galleries.destroy', [$event, $gallery]) }}" method="POST" onsubmit="return confirm('Hapus gambar ini?')" class="mt-2">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="text-red-500 hover:text-red-700 text-xs font-medium">Hapus</button>
                    </form>
                </div>
            </div>
        @endforeach
    </div>
    <div class="mt-6">
        {{ $galleries->links() }}
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">🖼</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Gallery</h3>
        <p class="text-gray-500 text-sm">Upload foto-foto event di atas.</p>
    </div>
@endif
@endsection
