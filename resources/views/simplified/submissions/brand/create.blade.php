@extends('simplified.layouts.dashboard')
@section('title', 'Ajukan Brand')
@section('content')
<a href="{{ route('simplified.dashboard') }}" class="text-sm text-indigo-600">← Kembali</a>
<h1 class="text-2xl font-bold text-gray-900 mt-2 mb-1">🏷️ Ajukan Brand</h1>
<p class="text-sm text-gray-600 mb-6">Setelah disetujui, kamu otomatis menjadi brand_owner.</p>

@if($errors->any())
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
        <ul class="list-disc pl-4">@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
    </div>
@endif

<form method="POST" action="{{ route('simplified.apply.brand.store') }}" enctype="multipart/form-data" class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
    @csrf
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Brand *</label>
        <input type="text" name="brand_name" value="{{ old('brand_name') }}" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Industri</label>
        <input type="text" name="industry" value="{{ old('industry') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi * (min 30 karakter)</label>
        <textarea name="brand_description" rows="4" required minlength="30" class="w-full border border-gray-300 rounded-lg px-3 py-2">{{ old('brand_description') }}</textarea>
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input type="url" name="website" value="{{ old('website') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Relasi dengan Perusahaan *</label>
        <select name="company_relation" id="company_relation" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="independent" {{ old('company_relation')==='independent'?'selected':'' }}>Independen (tanpa perusahaan)</option>
            <option value="under_existing_company" {{ old('company_relation')==='under_existing_company'?'selected':'' }}>Di bawah perusahaan yang sudah ada</option>
            <option value="will_create_company_later" {{ old('company_relation')==='will_create_company_later'?'selected':'' }}>Akan buat perusahaan nanti</option>
        </select>
    </div>
    <div id="company_picker" style="display:none">
        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Perusahaan</label>
        <select name="company_id" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">-- Pilih perusahaan --</option>
            @foreach($companies as $co)
                <option value="{{ $co->id }}" {{ (string)old('company_id')===(string)$co->id?'selected':'' }}>{{ $co->name }}</option>
            @endforeach
        </select>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Kontak</label>
            <input type="email" name="contact_email" value="{{ old('contact_email') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telepon Kontak</label>
            <input type="text" name="contact_phone" value="{{ old('contact_phone') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Logo (jpg/png/webp, max 2MB)</label>
            <input type="file" name="logo" accept="image/jpeg,image/png,image/webp" class="w-full text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Banner (jpg/png/webp, max 4MB)</label>
            <input type="file" name="banner" accept="image/jpeg,image/png,image/webp" class="w-full text-sm">
        </div>
    </div>

    <button type="submit" class="komuna-gradient text-white font-semibold px-6 py-2.5 rounded-lg">Kirim Pengajuan</button>
</form>

<script>
document.getElementById('company_relation').addEventListener('change', function() {
    document.getElementById('company_picker').style.display = this.value === 'under_existing_company' ? 'block' : 'none';
});
document.getElementById('company_relation').dispatchEvent(new Event('change'));
</script>
@endsection
