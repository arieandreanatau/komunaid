@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Buat Sub Komunitas Baru</h1>
    <p class="text-komuna-muted">{{ $community->name }}</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.subgroups.store', $community) }}" method="POST" class="space-y-6">
        @csrf

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Nama Sub Komunitas *</label>
            <input type="text" name="name" value="{{ old('name') }}" required
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('name') border-komuna-danger @enderror"
                placeholder="Contoh: Divisi Marketing">
            @error('name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
        </div>

        @if($parentSubgroups->count() > 0)
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Parent Sub Komunitas (opsional)</label>
                <select name="parent_id"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="">Tidak ada parent (root)</option>
                    @foreach($parentSubgroups as $parent)
                        <option value="{{ $parent->id }}" {{ old('parent_id') == $parent->id ? 'selected' : '' }}>{{ $parent->name }}</option>
                    @endforeach
                </select>
            </div>
        @endif

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="3"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description') }}</textarea>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Buat Sub Komunitas
            </button>
            <a href="{{ route('community.subgroups.index', $community) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
