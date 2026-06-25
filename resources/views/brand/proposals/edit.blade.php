@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Edit Proposal</h1>
    <p class="text-komuna-muted">Perbarui proposal kolaborasi.</p>
</div>

<form method="POST" action="{{ route('brand.proposals.update', $proposal) }}" enctype="multipart/form-data" class="max-w-3xl">
    @csrf
    @method('PUT')
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 space-y-6">
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Judul <span class="text-komuna-danger">*</span></label>
            <input type="text" name="title" value="{{ old('title', $proposal->title) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required>
            @error('title') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="4" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">{{ old('description', $proposal->description) }}</textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Kolaborasi</label>
                <select name="collaboration_type_id" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">
                    <option value="">Pilih Tipe</option>
                    @foreach($collaborationTypes as $type)
                        <option value="{{ $type->id }}" {{ old('collaboration_type_id', $proposal->collaboration_type_id) == $type->id ? 'selected' : '' }}>{{ $type->name }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Budget (Rp)</label>
                <input type="number" name="estimated_budget" value="{{ old('estimated_budget', $proposal->estimated_budget) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" min="0">
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Objektif</label>
                <input type="text" name="objective" value="{{ old('objective', $proposal->objective) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Target Audience</label>
                <input type="text" name="target_audience" value="{{ old('target_audience', $proposal->target_audience) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Benefit Brand</label>
                <input type="text" name="benefit_for_brand" value="{{ old('benefit_for_brand', $proposal->benefit_for_brand) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Benefit Komunitas</label>
                <input type="text" name="benefit_for_community" value="{{ old('benefit_for_community', $proposal->benefit_for_community) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Timeline</label>
            <input type="text" name="timeline" value="{{ old('timeline', $proposal->timeline) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Lampiran Baru (opsional)</label>
            <input type="file" name="attachment" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp">
            @if($proposal->attachment_path)
                <p class="text-xs text-komuna-muted mt-1">File saat ini: {{ basename($proposal->attachment_path) }}</p>
            @endif
        </div>
    </div>

    <div class="flex items-center gap-3 mt-6">
        <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Simpan Perubahan</button>
        <a href="{{ route('brand.proposals.show', $proposal) }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Batal</a>
    </div>
</form>
@endsection
