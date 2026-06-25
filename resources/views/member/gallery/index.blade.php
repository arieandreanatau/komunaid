@extends('layouts.dashboard')

@php $pageTitle = 'Galeri Kegiatan' @endphp

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Galeri Kegiatan</h1>
        <p class="text-komuna-muted">{{ $galleries->total() }} foto kegiatan.</p>
    </div>
    <a href="{{ route('member.galleries.create') }}"
       class="bg-komuna-cyan text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-cyan/90 transition inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Unggah
    </a>
</div>

@if($galleries->count() > 0)
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @foreach($galleries as $gallery)
            <div class="bg-komuna-light rounded-2xl border border-komuna-border overflow-hidden hover:shadow-md transition">
                <div class="aspect-video bg-komuna-soft relative">
                    <img src="{{ asset('storage/' . $gallery->image) }}" alt="{{ $gallery->caption }}" class="w-full h-full object-cover">
                    <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium
                        @if($gallery->visibility === 'public') bg-komuna-green/90 text-white
                        @elseif($gallery->visibility === 'friends') bg-komuna-blue/90 text-white
                        @else bg-komuna-navy/90 text-white
                        @endif">
                        {{ ucfirst($gallery->visibility) }}
                    </span>
                </div>
                <div class="p-4">
                    <p class="text-sm text-komuna-text font-medium line-clamp-2 mb-2">{{ $gallery->caption ?? 'Tanpa keterangan' }}</p>
                    <div class="flex items-center gap-2 text-xs text-komuna-muted mb-3">
                        @if($gallery->community)
                            <span class="flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                {{ $gallery->community->name }}
                            </span>
                        @endif
                        @if($gallery->event)
                            <span class="flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                {{ $gallery->event->title }}
                            </span>
                        @endif
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-komuna-muted">{{ $gallery->activity_date ? $gallery->activity_date->format('d M Y') : $gallery->created_at->format('d M Y') }}</span>
                        <div class="flex items-center gap-2">
                            <a href="{{ route('member.galleries.edit', $gallery) }}" class="text-xs font-medium text-komuna-teal hover:text-komuna-teal/80 transition">Edit</a>
                            <form method="POST" action="{{ route('member.galleries.destroy', $gallery) }}" onsubmit="return confirm('Yakin ingin menghapus foto ini?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-xs font-medium text-komuna-danger hover:text-komuna-danger/80 transition">Hapus</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
    <div class="mt-6">{{ $galleries->links() }}</div>
@else
    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-8 text-center">
        <div class="text-4xl mb-3">🖼️</div>
        <h3 class="font-semibold text-komuna-navy mb-1">Belum ada galeri kegiatan.</h3>
        <p class="text-komuna-muted text-sm mb-4">Mulai unggah foto kegiatan Anda.</p>
        <a href="{{ route('member.galleries.create') }}" class="inline-block bg-komuna-cyan text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-komuna-cyan/90 transition">
            Unggah Foto
        </a>
    </div>
@endif
@endsection
