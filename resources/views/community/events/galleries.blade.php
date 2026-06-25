@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Gallery Event</h1>
        <p class="text-komuna-muted">{{ $event->title }}</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 mb-6">
    <h3 class="font-semibold text-komuna-text mb-4">Upload Gallery</h3>
    <form action="{{ route('community.events.galleries.store', $event) }}" method="POST" enctype="multipart/form-data" class="space-y-4">
        @csrf
        <div>
            <input type="file" name="images[]" multiple accept="image/*" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            <p class="text-xs text-komuna-muted mt-1">Maksimal 10 gambar, 5MB per gambar</p>
        </div>
        <div>
            <input type="text" name="captions[]" placeholder="Caption untuk gambar (opsional)" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
        </div>
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Upload</button>
    </form>
</div>

@if($galleries->count() > 0)
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        @foreach($galleries as $gallery)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden group">
                <div class="aspect-square bg-komuna-border-soft">
                    <img src="{{ Storage::url($gallery->image_path) }}" alt="{{ $gallery->caption }}" class="w-full h-full object-cover">
                </div>
                <div class="p-3">
                    <p class="text-xs text-komuna-muted">{{ $gallery->uploader->name }}</p>
                    @if($gallery->caption)
                        <p class="text-sm text-komuna-text mt-1">{{ $gallery->caption }}</p>
                    @endif
                    <form action="{{ route('community.events.galleries.destroy', [$event, $gallery]) }}" method="POST" onsubmit="return confirm('Hapus gambar ini?')" class="mt-2">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="text-komuna-danger hover:text-komuna-danger text-xs font-medium">Hapus</button>
                    </form>
                </div>
            </div>
        @endforeach
    </div>
    <div class="mt-6">
        {{ $galleries->links() }}
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">🖼</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Gallery</h3>
        <p class="text-komuna-muted text-sm">Upload foto-foto event di atas.</p>
    </div>
@endif
@endsection
