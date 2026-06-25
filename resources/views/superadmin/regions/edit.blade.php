@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-komuna-text">Edit Region: {{ $region->name }}</h1>
    <p class="text-komuna-muted">Perbarui informasi region</p>
</div>

<div class="bg-white rounded-xl shadow-sm p-6 max-w-xl">
    <form method="POST" action="{{ route('superadmin.regions.update', $region) }}">
        @csrf
        @method('PUT')
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Name <span class="text-komuna-danger">*</span></label>
                <input type="text" name="name" value="{{ old('name', $region->name) }}" required
                       class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Code</label>
                <input type="text" name="code" value="{{ old('code', $region->code) }}"
                       class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Province</label>
                <input type="text" name="province" value="{{ old('province', $region->province) }}"
                       class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Description</label>
                <textarea name="description" rows="3"
                          class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description', $region->description) }}</textarea>
            </div>
            <div class="flex items-center">
                <input type="hidden" name="is_active" value="0">
                <input type="checkbox" name="is_active" value="1" {{ old('is_active', $region->is_active) ? 'checked' : '' }}
                       class="rounded border-komuna-border text-komuna-success focus:ring-emerald-500">
                <label class="ml-2 text-sm text-komuna-text">Active</label>
            </div>
        </div>
        <div class="mt-6 flex space-x-3">
            <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Update</button>
            <a href="{{ route('superadmin.regions.index') }}" class="bg-komuna-border text-komuna-text px-4 py-2 rounded-lg text-sm hover:bg-komuna-border">Batal</a>
        </div>
    </form>
</div>
@endsection
