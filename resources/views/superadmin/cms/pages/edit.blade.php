@extends('layouts.admin')

@section('content')
<div class="max-w-2xl">
    <h2 class="text-xl font-bold text-komuna-text mb-6">Edit Halaman: {{ $page->title }}</h2>
    <form action="{{ route('superadmin.cms.pages.update', $page) }}" method="POST" class="bg-white rounded-2xl border border-komuna-border-soft p-6 space-y-4">
        @csrf @method('PUT')
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Judul <span class="text-red-500">*</span></label>
            <input type="text" name="title" value="{{ old('title', $page->title) }}" required class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Content</label>
            <textarea name="content" rows="15" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">{{ old('content', $page->content) }}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Meta Title</label>
                <input type="text" name="meta_title" value="{{ old('meta_title', $page->meta_title) }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Status</label>
                <select name="status" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                    <option value="draft" {{ ($page->status ?? 'draft') === 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="published" {{ ($page->status ?? 'draft') === 'published' ? 'selected' : '' }}>Published</option>
                </select>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Meta Description</label>
                <textarea name="meta_description" rows="2" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">{{ old('meta_description', $page->meta_description) }}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Bahasa</label>
                <select name="language_code" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                    <option value="id" {{ ($page->language_code ?? 'id') === 'id' ? 'selected' : '' }}>ID</option>
                    <option value="en" {{ ($page->language_code ?? 'id') === 'en' ? 'selected' : '' }}>EN</option>
                    <option value="su" {{ ($page->language_code ?? 'id') === 'su' ? 'selected' : '' }}>SU</option>
                </select>
            </div>
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy transition">Update</button>
            <a href="{{ route('superadmin.cms.pages.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm py-2">Batal</a>
        </div>
    </form>
</div>
@endsection
