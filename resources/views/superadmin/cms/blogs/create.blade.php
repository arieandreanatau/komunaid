@extends('layouts.admin')

@section('content')
<div class="max-w-2xl">
    <h2 class="text-xl font-bold text-komuna-text mb-6">Tambah Blog</h2>
    <form action="{{ route('superadmin.cms.blogs.store') }}" method="POST" enctype="multipart/form-data" class="bg-white rounded-2xl border border-komuna-border-soft p-6 space-y-4">
        @csrf
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Judul <span class="text-red-500">*</span></label>
            <input type="text" name="title" value="{{ old('title') }}" required class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Slug <span class="text-komuna-light-text">(otomatis jika kosong)</span></label>
            <input type="text" name="slug" value="{{ old('slug') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Excerpt</label>
            <textarea name="excerpt" rows="2" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">{{ old('excerpt') }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Content <span class="text-red-500">*</span></label>
            <textarea name="content" rows="10" required class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">{{ old('content') }}</textarea>
            @error('content') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Cover Image</label>
            <input type="file" name="cover" accept="image/*" class="w-full text-sm">
        </div>
        <div class="grid grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kategori</label>
                <input type="text" name="category" value="{{ old('category') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Status</label>
                <select name="status" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Bahasa</label>
                <select name="language_code" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                    <option value="id">ID</option>
                    <option value="en">EN</option>
                    <option value="su">SU</option>
                </select>
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Tags <span class="text-komuna-light-text">(koma)</span></label>
            <input type="text" name="tags" value="{{ old('tags') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm" placeholder="komunitas, event, tips">
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy transition">Simpan</button>
            <a href="{{ route('superadmin.cms.blogs.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm py-2">Batal</a>
        </div>
    </form>
</div>
@endsection
