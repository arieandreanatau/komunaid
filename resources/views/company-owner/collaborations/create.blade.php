@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Ajukan Proposal Kolaborasi</h1>
    <p class="text-komuna-muted">Kirim proposal kolaborasi atas nama perusahaan atau brand.</p>
</div>

@if($companies->isEmpty() && $brands->isEmpty())
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">🏢</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Perusahaan/Brand</h3>
        <p class="text-komuna-muted text-sm mb-4">Buat perusahaan atau brand terlebih dahulu.</p>
        <a href="{{ route('company-owner.companies.create') }}" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Buat Perusahaan</a>
    </div>
@else
    <form method="POST" action="{{ route('company-owner.collaborations.store') }}" enctype="multipart/form-data" class="max-w-3xl">
        @csrf
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 space-y-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Pengaju <span class="text-komuna-danger">*</span></label>
                <select name="proposer_id" id="proposer_id" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required onchange="document.getElementById('proposer_type').value = this.options[this.selectedIndex].dataset.type">
                    <option value="">Pilih Perusahaan atau Brand</option>
                    @foreach($companies as $company)
                        <option value="{{ $company->id }}" data-type="company" {{ old('proposer_id') == $company->id ? 'selected' : '' }}>[Perusahaan] {{ $company->name }}</option>
                    @endforeach
                    @foreach($brands as $brand)
                        <option value="{{ $brand->id }}" data-type="brand" {{ old('proposer_id') == $brand->id ? 'selected' : '' }}>[Brand] {{ $brand->name }}</option>
                    @endforeach
                </select>
                <input type="hidden" name="proposer_type" id="proposer_type" value="{{ old('proposer_type', 'company') }}">
                @error('proposer_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Target Komunitas <span class="text-komuna-danger">*</span></label>
                <input type="hidden" name="target_type" value="community">
                <select name="target_id" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required>
                    <option value="">Pilih Komunitas</option>
                    @foreach($communities as $community)
                        <option value="{{ $community->id }}" {{ (old('target_id') == $community->id || $selectedCommunity == $community->id) ? 'selected' : '' }}>{{ $community->name }}</option>
                    @endforeach
                </select>
                @error('target_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Kolaborasi</label>
                <select name="collaboration_type_id" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">
                    <option value="">Pilih Tipe</option>
                    @foreach($collaborationTypes as $type)
                        <option value="{{ $type->id }}" {{ old('collaboration_type_id') == $type->id ? 'selected' : '' }}>{{ $type->name }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Judul Proposal <span class="text-komuna-danger">*</span></label>
                <input type="text" name="title" value="{{ old('title') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required>
                @error('title') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
                <textarea name="description" rows="4" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">{{ old('description') }}</textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Objektif</label>
                    <input type="text" name="objective" value="{{ old('objective') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Target Audience</label>
                    <input type="text" name="target_audience" value="{{ old('target_audience') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Benefit untuk Brand</label>
                    <input type="text" name="benefit_for_brand" value="{{ old('benefit_for_brand') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Benefit untuk Komunitas</label>
                    <input type="text" name="benefit_for_community" value="{{ old('benefit_for_community') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Estimasi Budget (Rp)</label>
                    <input type="number" name="estimated_budget" value="{{ old('estimated_budget') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" min="0" step="1000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Timeline</label>
                    <input type="text" name="timeline" value="{{ old('timeline') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Lampiran (PDF/DOC/JPG/PNG, max 4MB)</label>
                <input type="file" name="attachment" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp">
            </div>
        </div>

        <div class="flex items-center gap-3 mt-6">
            <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Simpan Draft</button>
            <a href="{{ route('company-owner.collaborations.index') }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Batal</a>
        </div>
    </form>
@endif
@endsection
