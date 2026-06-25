@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Ajukan Collaboration</h1>
    <p class="text-komuna-muted">Kirim collaboration request ke komunitas lain.</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.collaborations.store') }}" method="POST" class="space-y-6">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Komunitas Pengirim *</label>
                <select name="community_id" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="">Pilih Komunitas</option>
                    @foreach($communities as $community)
                        <option value="{{ $community->id }}" {{ old('community_id') == $community->id ? 'selected' : '' }}>{{ $community->name }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Komunitas Target *</label>
                <select name="target_community_id" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="">Pilih Komunitas Target</option>
                    @foreach($targetCommunities as $community)
                        <option value="{{ $community->id }}" {{ old('target_community_id') == $community->id ? 'selected' : '' }}>{{ $community->name }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Judul *</label>
                <input type="text" name="title" value="{{ old('title') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Collaboration *</label>
                <input type="text" name="collaboration_type" value="{{ old('collaboration_type') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" placeholder="Contoh: Event, Campaign, dll">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Budget (Rp)</label>
                <input type="number" name="budget" value="{{ old('budget') }}" min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Event</label>
                <input type="date" name="event_date" value="{{ old('event_date') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Person</label>
                <input type="text" name="contact_person" value="{{ old('contact_person') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Email</label>
                <input type="email" name="contact_email" value="{{ old('contact_email') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Phone</label>
                <input type="text" name="contact_phone" value="{{ old('contact_phone') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Proposal</label>
            <textarea name="proposal" rows="5" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('proposal') }}</textarea>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Kirim Request
            </button>
            <a href="{{ route('community.collaborations.index') }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
