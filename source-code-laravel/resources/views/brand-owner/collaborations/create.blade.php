@extends('layouts.app')
@section('title', 'Ajukan Kolaborasi')
@section('content')
<div class="max-w-3xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.collaborations.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Ajukan Kolaborasi</h1>
    <div class="bg-white rounded-xl border p-6">
        @if($errors->any())
            <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <ul class="list-disc list-inside">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        <form action="{{ route('brand-owner.collaborations.store') }}" method="POST">
            @csrf
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                    <select name="brand_id" required class="w-full px-4 py-2 border rounded-lg">
                        <option value="">Pilih Brand</option>
                        @foreach($brands as $brand)
                            <option value="{{ $brand->id }}" {{ old('brand_id') == $brand->id ? 'selected' : '' }}>{{ $brand->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Komunitas *</label>
                    <select name="community_id" required class="w-full px-4 py-2 border rounded-lg">
                        <option value="">Pilih Komunitas</option>
                        @foreach($communities as $community)
                            <option value="{{ $community->id }}" {{ old('community_id', $selectedCommunity) == $community->id ? 'selected' : '' }}>{{ $community->name }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Campaign (opsional)</label>
                <select name="campaign_id" class="w-full px-4 py-2 border rounded-lg">
                    <option value="">-- Pilih Campaign --</option>
                    @foreach($campaigns as $campaign)
                        <option value="{{ $campaign->id }}" {{ old('campaign_id') == $campaign->id ? 'selected' : '' }}>{{ $campaign->title }}</option>
                    @endforeach
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Kolaborasi *</label>
                <select name="type" required class="w-full px-4 py-2 border rounded-lg">
                    <option value="">Pilih Tipe</option>
                    <option value="free_collaboration" {{ old('type') === 'free_collaboration' ? 'selected' : '' }}>Free Collaboration</option>
                    <option value="paid_collaboration" {{ old('type') === 'paid_collaboration' ? 'selected' : '' }}>Paid Collaboration</option>
                    <option value="sponsorship" {{ old('type') === 'sponsorship' ? 'selected' : '' }}>Sponsorship</option>
                    <option value="csr_donation" {{ old('type') === 'csr_donation' ? 'selected' : '' }}>CSR Donation</option>
                    <option value="tap_in_event" {{ old('type') === 'tap_in_event' ? 'selected' : '' }}>Tap-in Event</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input type="text" name="title" value="{{ old('title') }}" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Proposal</label>
                <textarea name="description" rows="6" class="w-full px-4 py-2 border rounded-lg" placeholder="Jelaskan proposal kolaborasi Anda...">{{ old('description') }}</textarea>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                    <input type="date" name="start_date" value="{{ old('start_date') }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                    <input type="date" name="end_date" value="{{ old('end_date') }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Kirim Pengajuan</button>
        </form>
    </div>
</div>
@endsection
