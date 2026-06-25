@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Transfer Ownership</h1>
    <p class="text-komuna-muted">Transfer kepemilikan brand ke user lain.</p>
</div>

<div class="max-w-xl">
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
        <div class="mb-4 p-4 bg-komuna-warning-soft border border-yellow-200 rounded-lg text-sm text-komuna-warning">
            <strong>Perhatian:</strong> Setelah transfer, Anda tidak lagi bisa mengelola brand ini. Pastikan Anda yakin sebelum melanjutkan.
        </div>

        <div class="mb-4 p-4 bg-komuna-surface rounded-lg">
            <p class="text-sm text-komuna-muted">Brand: <strong class="text-komuna-text">{{ $brand->name }}</strong></p>
            <p class="text-sm text-komuna-muted">Owner saat ini: <strong class="text-komuna-text">{{ $brand->owner->name }}</strong></p>
        </div>

        <form method="POST" action="{{ route('brand.brands.transfer-owner.store', $brand) }}">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">New Owner User ID <span class="text-komuna-danger">*</span></label>
                    <input type="number" name="new_owner_id" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required min="1">
                    <p class="text-xs text-komuna-muted mt-1">Masukkan ID user baru (bisa dilihat dari URL profil user).</p>
                    @error('new_owner_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Alasan (opsional)</label>
                    <textarea name="reason" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" maxlength="1000">{{ old('reason') }}</textarea>
                </div>
            </div>

            <div class="flex items-center gap-3 mt-6">
                <button type="submit" class="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition" onclick="return confirm('Yakin ingin mentransfer brand ini?')">Transfer Sekarang</button>
                <a href="{{ route('brand.brands.show', $brand) }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Batal</a>
            </div>
        </form>
    </div>
</div>
@endsection
