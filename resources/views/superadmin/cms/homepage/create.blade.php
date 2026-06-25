@extends('layouts.admin')

@section('content')
<div class="max-w-2xl">
    <h2 class="text-xl font-bold text-komuna-text mb-6">Tambah Homepage Section</h2>
    <form action="{{ route('superadmin.cms.homepage.store') }}" method="POST" enctype="multipart/form-data" class="bg-white rounded-2xl border border-komuna-border-soft p-6 space-y-4">
        @csrf
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Key <span class="text-red-500">*</span></label>
            <input type="text" name="key" value="{{ old('key') }}" required class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm" placeholder="hero, value_proposition, how_it_works...">
            @error('key') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Title</label>
            <input type="text" name="title" value="{{ old('title') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Subtitle</label>
            <input type="text" name="subtitle" value="{{ old('subtitle') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Content</label>
            <textarea name="content" rows="5" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">{{ old('content') }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Image</label>
            <input type="file" name="image" accept="image/*" class="w-full text-sm">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Button Text</label>
                <input type="text" name="button_text" value="{{ old('button_text') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Button URL</label>
                <input type="text" name="button_url" value="{{ old('button_url') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Sort Order</label>
                <input type="number" name="sort_order" value="{{ old('sort_order', 0) }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Language</label>
                <select name="language_code" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                    <option value="su">Sunda</option>
                </select>
            </div>
            <div class="flex items-end pb-1">
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_active" value="1" {{ old('is_active', 1) ? 'checked' : '' }} class="rounded border-komuna-border text-komuna-blue focus:ring-komuna-blue">
                    Active
                </label>
            </div>
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy transition">Simpan</button>
            <a href="{{ route('superadmin.cms.homepage.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm py-2">Batal</a>
        </div>
    </form>
</div>
@endsection
