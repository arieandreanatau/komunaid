@extends('layouts.dashboard')
@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Buat Kampanye Volunteer</h1>
    <p class="text-komuna-muted">{{ $event->title }}</p>
</div>
<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.events.volunteer-campaign.store', $event) }}" method="POST" class="space-y-6">
        @csrf
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Judul *</label><input type="text" name="title" value="{{ old('title') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Quota *</label><input type="number" name="quota" value="{{ old('quota') }}" required min="1" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label><textarea name="description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description') }}</textarea></div>
            <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Positions (JSON)</label><textarea name="positions" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('positions') }}</textarea></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Mulai *</label><input type="date" name="start_date" value="{{ old('start_date') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Selesai *</label><input type="date" name="end_date" value="{{ old('end_date') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"></div>
            <div class="md:col-span-2"><label class="block text-sm font-medium text-komuna-text mb-1">Persyaratan</label><textarea name="requirements" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('requirements') }}</textarea></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Status</label><select name="status" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
        </div>
        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Buat Kampanye</button>
            <a href="{{ route('community.events.volunteer-campaign.index', $event) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection