@extends('layouts.app')
@section('title', 'Buat Komunitas')
@section('content')
<div class="max-w-3xl mx-auto px-4 py-8">
    <a href="{{ route('community-owner.communities.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Buat Komunitas Baru</h1>
    <div class="bg-white rounded-xl border p-6">
        <form action="{{ route('community-owner.communities.store') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Komunitas *</label>
                <input type="text" name="name" value="{{ old('name') }}" required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
                @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea name="description" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">{{ old('description') }}</textarea>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select name="category" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
                        <option value="technology">Technology</option>
                        <option value="business">Business</option>
                        <option value="music">Music</option>
                        <option value="art">Art</option>
                        <option value="sports">Sports</option>
                        <option value="other">Lainnya</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                    <input type="text" name="location" value="{{ old('location') }}" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" name="website" value="{{ old('website') }}" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <input type="file" name="logo" accept="image/*" class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Banner</label>
                    <input type="file" name="banner" accept="image/*" class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Buat Komunitas</button>
        </form>
    </div>
</div>
@endsection
