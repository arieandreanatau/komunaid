@extends('layouts.dashboard')

@php $pageTitle = 'Unggah Galeri' @endphp

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="mb-8">
        <a href="{{ route('member.galleries.index') }}" class="text-sm text-komuna-muted hover:text-komuna-teal transition inline-flex items-center gap-1 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali
        </a>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-navy">Unggah Galeri</h1>
        <p class="text-komuna-muted">Bagikan foto kegiatan Anda.</p>
    </div>

    <div class="bg-komuna-light rounded-2xl border border-komuna-border p-6">
        <form method="POST" action="{{ route('member.galleries.store') }}" enctype="multipart/form-data">
            @csrf
            <div class="space-y-5">
                <div>
                    <label for="image" class="block text-sm font-medium text-komuna-text mb-1">Foto <span class="text-komuna-danger">*</span></label>
                    <input type="file" name="image" id="image" accept="image/*" required
                           class="block w-full border border-komuna-border rounded-lg px-3 py-2 text-sm text-komuna-text bg-komuna-surface focus:ring-2 focus:ring-komuna-cyan focus:border-komuna-cyan"
                           onchange="document.getElementById('preview').src = window.URL.createObjectURL(this.files[0]); document.getElementById('preview-container').classList.remove('hidden')">
                    @error('image')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                    <div id="preview-container" class="hidden mt-3">
                        <img id="preview" src="" alt="Preview" class="w-full max-h-64 object-cover rounded-lg border border-komuna-border">
                    </div>
                </div>

                <div>
                    <label for="caption" class="block text-sm font-medium text-komuna-text mb-1">Keterangan</label>
                    <textarea name="caption" id="caption" rows="3" placeholder="Tulis keterangan foto..."
                              class="block w-full border border-komuna-border rounded-lg px-3 py-2 text-sm text-komuna-text bg-komuna-surface focus:ring-2 focus:ring-komuna-cyan focus:border-komuna-cyan">{{ old('caption') }}</textarea>
                    @error('caption')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="community_id" class="block text-sm font-medium text-komuna-text mb-1">Komunitas</label>
                        <select name="community_id" id="community_id"
                                class="block w-full border border-komuna-border rounded-lg px-3 py-2 text-sm text-komuna-text bg-komuna-surface focus:ring-2 focus:ring-komuna-cyan focus:border-komuna-cyan">
                            <option value="">Tidak ada</option>
                            @foreach($communities as $community)
                                <option value="{{ $community->id }}" {{ old('community_id') == $community->id ? 'selected' : '' }}>{{ $community->name }}</option>
                            @endforeach
                        </select>
                        @error('community_id')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label for="event_id" class="block text-sm font-medium text-komuna-text mb-1">Event</label>
                        <select name="event_id" id="event_id"
                                class="block w-full border border-komuna-border rounded-lg px-3 py-2 text-sm text-komuna-text bg-komuna-surface focus:ring-2 focus:ring-komuna-cyan focus:border-komuna-cyan">
                            <option value="">Tidak ada</option>
                            @foreach($events as $event)
                                <option value="{{ $event->id }}" {{ old('event_id') == $event->id ? 'selected' : '' }}>{{ $event->title }}</option>
                            @endforeach
                        </select>
                        @error('event_id')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="activity_date" class="block text-sm font-medium text-komuna-text mb-1">Tanggal Aktivitas</label>
                        <input type="date" name="activity_date" id="activity_date" value="{{ old('activity_date', date('Y-m-d')) }}"
                               class="block w-full border border-komuna-border rounded-lg px-3 py-2 text-sm text-komuna-text bg-komuna-surface focus:ring-2 focus:ring-komuna-cyan focus:border-komuna-cyan">
                        @error('activity_date')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label for="visibility" class="block text-sm font-medium text-komuna-text mb-1">Visibilitas <span class="text-komuna-danger">*</span></label>
                        <select name="visibility" id="visibility" required
                                class="block w-full border border-komuna-border rounded-lg px-3 py-2 text-sm text-komuna-text bg-komuna-surface focus:ring-2 focus:ring-komuna-cyan focus:border-komuna-cyan">
                            <option value="public" {{ old('visibility') === 'public' ? 'selected' : '' }}>Publik</option>
                            <option value="friends" {{ old('visibility') === 'friends' ? 'selected' : '' }}>Teman</option>
                            <option value="private" {{ old('visibility') === 'private' ? 'selected' : '' }}>Privat</option>
                        </select>
                        @error('visibility')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div class="flex justify-end pt-2">
                    <button type="submit" class="bg-komuna-cyan text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-komuna-cyan/90 transition">
                        Unggah
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
