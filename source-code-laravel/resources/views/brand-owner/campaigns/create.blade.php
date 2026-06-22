@extends('layouts.app')
@section('title', 'Buat Campaign')
@section('content')
<div class="max-w-3xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.campaigns.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Buat Campaign Baru</h1>
    <div class="bg-white rounded-xl border p-6">
        <form action="{{ route('brand-owner.campaigns.store') }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <select name="brand_id" required class="w-full px-4 py-2 border rounded-lg">
                    @foreach($brands as $brand)
                        <option value="{{ $brand->id }}">{{ $brand->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Campaign *</label>
                <input type="text" name="title" value="{{ old('title') }}" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea name="description" rows="4" class="w-full px-4 py-2 border rounded-lg">{{ old('description') }}</textarea>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <input type="number" name="budget" value="{{ old('budget') }}" min="0" class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <input type="text" name="target_audience" value="{{ old('target_audience') }}" class="w-full px-4 py-2 border rounded-lg">
                </div>
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
            <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Buat Campaign</button>
        </form>
    </div>
</div>
@endsection
