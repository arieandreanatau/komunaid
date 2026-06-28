@extends('simplified.layouts.dashboard')
@section('title', 'Ajukan Komunitas')
@section('content')
<a href="{{ route('simplified.dashboard') }}" class="text-sm text-indigo-600">← Kembali</a>
<h1 class="text-2xl font-bold text-gray-900 mt-2 mb-1">🤝 Ajukan Komunitas</h1>
<p class="text-sm text-gray-600 mb-6">Setelah disetujui, kamu otomatis menjadi community_owner dan bisa mulai kelola komunitas.</p>

@if($errors->any())
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
        <ul class="list-disc pl-4">
            @foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach
        </ul>
    </div>
@endif

<form method="POST" action="{{ route('simplified.apply.community.store') }}" enctype="multipart/form-data" class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
    @csrf
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Komunitas *</label>
        <input type="text" name="community_name" value="{{ old('community_name') }}" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
        <select name="category_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">-- Pilih kategori --</option>
            @foreach(\App\Models\CommunityCategory::orderBy('name')->get() as $cat)
                <option value="{{ $cat->id }}" {{ (string)old('category_id')===(string)$cat->id?'selected':'' }}>{{ $cat->name }}</option>
            @endforeach
        </select>
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi * (min 30 karakter)</label>
        <textarea name="description" rows="4" required minlength="30" class="w-full border border-gray-300 rounded-lg px-3 py-2">{{ old('description') }}</textarea>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
            <input type="text" name="province" value="{{ old('province') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kota</label>
            <input type="text" name="city" value="{{ old('city') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
        </div>
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
        <input type="text" name="address" value="{{ old('address') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
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
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Social Media (URL)</label>
        <input type="text" name="social_media" value="{{ old('social_media') }}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
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
@endsection
