@extends('layouts.app')
@section('title', 'Buat Event')
@section('content')
<div class="max-w-3xl mx-auto px-4 py-8">
    <a href="{{ route('community-owner.communities.events.index', $community->id) }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Buat Event Baru</h1>
    <div class="bg-white rounded-xl border p-6">
        <form action="{{ route('community-owner.communities.events.store', $community->id) }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Event *</label>
                <input type="text" name="title" value="{{ old('title') }}" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea name="description" rows="4" class="w-full px-4 py-2 border rounded-lg">{{ old('description') }}</textarea>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
                    <input type="text" name="location" value="{{ old('location') }}" required class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Harga Tiket</label>
                    <input type="number" name="ticket_price" value="{{ old('ticket_price', 0) }}" min="0" class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                    <input type="datetime-local" name="start_date" value="{{ old('start_date') }}" required class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
                    <input type="datetime-local" name="end_date" value="{{ old('end_date') }}" required class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Peserta</label>
                    <input type="number" name="max_participants" value="{{ old('max_participants') }}" min="1" class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div class="flex items-center gap-2 pt-6">
                    <input type="checkbox" name="is_online" value="1" {{ old('is_online') ? 'checked' : '' }} class="rounded">
                    <label class="text-sm text-gray-700">Event Online</label>
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Banner</label>
                <input type="file" name="banner" accept="image/*" class="w-full px-4 py-2 border rounded-lg">
            </div>
            <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Buat Event</button>
        </form>
    </div>
</div>
@endsection
