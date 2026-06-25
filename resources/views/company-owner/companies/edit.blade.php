@extends('layouts.dashboard')
@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Edit Perusahaan</h1>
    <p class="text-komuna-muted">Perbarui informasi perusahaan.</p>
</div>
<form method="POST" action="{{ route('company-owner.companies.update', $company) }}" enctype="multipart/form-data" class="max-w-3xl">
    @csrf
    @method('PUT')
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 space-y-6">
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Nama <span class="text-komuna-danger">*</span></label>
            <input type="text" name="name" value="{{ old('name', $company->name) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Legal Name</label><input type="text" name="legal_name" value="{{ old('legal_name', $company->legal_name) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Industri</label><input type="text" name="industry" value="{{ old('industry', $company->industry) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
        </div>
        <div><label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label><textarea name="description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">{{ old('description', $company->description) }}</textarea></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Website</label><input type="url" name="website_url" value="{{ old('website_url', $company->website_url) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Email</label><input type="email" name="email" value="{{ old('email', $company->email) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Telepon</label><input type="text" name="phone" value="{{ old('phone', $company->phone) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Kota</label><input type="text" name="city" value="{{ old('city', $company->city) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Provinsi</label><input type="text" name="province" value="{{ old('province', $company->province) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
        </div>
        <div><label class="block text-sm font-medium text-komuna-text mb-1">Alamat</label><input type="text" name="address" value="{{ old('address', $company->address) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Logo Baru (opsional)</label>
            <input type="file" name="logo" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" accept=".jpg,.jpeg,.png,.webp">
            @if($company->logo_path)<p class="text-xs text-komuna-muted mt-1">File saat ini: {{ basename($company->logo_path) }}</p>@endif
        </div>
    </div>
    <div class="flex items-center gap-3 mt-6">
        <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Simpan Perubahan</button>
        <a href="{{ route('company-owner.companies.show', $company) }}" class="text-komuna-muted hover:text-komuna-text text-sm font-medium">Batal</a>
    </div>
</form>
@endsection
