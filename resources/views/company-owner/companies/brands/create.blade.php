@extends('layouts.dashboard')
@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Buat Brand - {{ $company->name }}</h1>
    <p class="text-komuna-muted">Tambahkan brand baru di bawah perusahaan ini.</p>
</div>
<form method="POST" action="{{ route('company-owner.companies.brands.store', $company) }}" enctype="multipart/form-data" class="max-w-3xl">
    @csrf
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 space-y-6">
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Nama Brand <span class="text-komuna-danger">*</span></label>
            <input type="text" name="name" value="{{ old('name') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required>
            @error('name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div><label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label><textarea name="description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">{{ old('description') }}</textarea></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Industri</label><input type="text" name="industry" value="{{ old('industry') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Website</label><input type="url" name="website_url" value="{{ old('website_url') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Instagram</label><input type="url" name="instagram_url" value="{{ old('instagram_url') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Email</label><input type="email" name="email" value="{{ old('email') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
        </div>
        <div><label class="block text-sm font-medium text-komuna-text mb-1">Telepon</label><input type="text" name="phone" value="{{ old('phone') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Logo (JPG/PNG/WebP, max 4MB)</label>
            <input type="file" name="logo" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" accept=".jpg,.jpeg,.png,.webp">
        </div>
    </div>
    <div class="flex items-center gap-3 mt-6">
        <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Simpan</button>
        <a href="{{ route('company-owner.companies.brands.index', $company) }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Batal</a>
    </div>
</form>
@endsection
