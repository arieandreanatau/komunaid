@extends('layouts.app')
@section('title', 'Edit Brand')
@section('content')
<div class="max-w-3xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.brands.show', $brand) }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Edit Brand</h1>
    <div class="bg-white rounded-xl border p-6">
        @if($errors->any())
            <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <ul class="list-disc list-inside">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        <form action="{{ route('brand-owner.brands.update', $brand) }}" method="POST" enctype="multipart/form-data">
            @csrf @method('PUT')
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Brand</label>
                <input type="text" name="name" value="{{ old('name', $brand->name) }}" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue @error('name') border-red-500 @enderror">
                @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea name="description" rows="4" class="w-full px-4 py-2 border rounded-lg">{{ old('description', $brand->description) }}</textarea>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Industri</label>
                    <input type="text" name="industry" value="{{ old('industry', $brand->industry) }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input type="url" name="website" value="{{ old('website', $brand->website) }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input type="text" name="instagram" value="{{ old('instagram', $brand->instagram) }}" class="w-full px-4 py-2 border rounded-lg" placeholder="@username">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input type="text" name="contact_person" value="{{ old('contact_person', $brand->contact_person) }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Kontak</label>
                    <input type="email" name="contact_email" value="{{ old('contact_email', $brand->contact_email) }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                    <input type="text" name="contact_phone" value="{{ old('contact_phone', $brand->contact_phone) }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Logo (upload baru untuk ganti)</label>
                    <input type="file" name="logo" accept="image/*" class="w-full px-4 py-2 border rounded-lg">
                    @if($brand->logo)
                        <img src="{{ Storage::url($brand->logo) }}" alt="Logo" class="w-16 h-16 rounded-lg object-cover mt-2">
                    @endif
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Banner (upload baru untuk ganti)</label>
                    <input type="file" name="banner" accept="image/*" class="w-full px-4 py-2 border rounded-lg">
                    @if($brand->banner)
                        <img src="{{ Storage::url($brand->banner) }}" alt="Banner" class="w-48 h-24 rounded-lg object-cover mt-2">
                    @endif
                </div>
            </div>
            <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Simpan Perubahan</button>
        </form>
    </div>
</div>
@endsection
