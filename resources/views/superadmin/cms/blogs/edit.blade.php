@extends('layouts.admin')

@section('content')
<div class="max-w-2xl">
    <h2 class="text-xl font-bold text-komuna-text mb-6">Edit Blog: {{ $blog->title }}</h2>
    <form action="{{ route('superadmin.cms.blogs.update', $blog) }}" method="POST" enctype="multipart/form-data" class="bg-white rounded-2xl border border-komuna-border-soft p-6 space-y-4">
        @csrf @method('PUT')
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Judul <span class="text-red-500">*</span></label>
            <input type="text" name="title" value="{{ old('title', $blog->title) }}" required class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Slug</label>
            <input type="text" name="slug" value="{{ old('slug', $blog->slug) }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Excerpt</label>
            <textarea name="excerpt" rows="2" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">{{ old('excerpt', $blog->excerpt) }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Content <span class="text-red-500">*</span></label>
            <textarea name="content" rows="10" required class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">{{ old('content', $blog->content) }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Cover Image</label>
            @if($blog->cover_path)
                <img src="{{ asset('storage/' . $blog->cover_path) }}" class="w-32 h-20 object-cover rounded-lg mb-2">
            @endif
            <input type="file" name="cover" accept="image/*" class="w-full text-sm">
        </div>
        <div class="grid grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kategori</label>
                <input type="text" name="category" value="{{ old('category', $blog->category) }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Status</label>
                <select name="status" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                    <option value="draft" {{ $blog->status === 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="published" {{ $blog->status === 'published' ? 'selected' : '' }}>Published</option>
                    <option value="archived" {{ $blog->status === 'archived' ? 'selected' : '' }}>Archived</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Bahasa</label>
                <select name="language_code" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                    <option value="id" {{ $blog->language_code === 'id' ? 'selected' : '' }}>ID</option>
                    <option value="en" {{ $blog->language_code === 'en' ? 'selected' : '' }}>EN</option>
                    <option value="su" {{ $blog->language_code === 'su' ? 'selected' : '' }}>SU</option>
                </select>
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Tags <span class="text-komuna-light-text">(koma)</span></label>
            <input type="text" name="tags" value="{{ old('tags', is_array($blog->tags) ? implode(', ', $blog->tags) : '') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy transition">Update</button>
            <a href="{{ route('superadmin.cms.blogs.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm py-2">Batal</a>
        </div>
    </form>
</div>
@endsection
