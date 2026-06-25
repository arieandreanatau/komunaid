@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Ajukan Kolaborasi</h1>
    <p class="text-komuna-muted">Kirim pengajuan kolaborasi ke komunitas.</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('brand.collaborations.store') }}" method="POST" class="space-y-6">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Brand *</label>
                <select name="brand_id" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('brand_id') border-komuna-danger @enderror">
                    <option value="">Pilih Brand</option>
                    @foreach($brands as $brand)
                        <option value="{{ $brand->id }}" {{ old('brand_id') == $brand->id ? 'selected' : '' }}>{{ $brand->name }}</option>
                    @endforeach
                </select>
                @error('brand_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Komunitas *</label>
                <select name="community_id" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('community_id') border-komuna-danger @enderror">
                    <option value="">Pilih Komunitas</option>
                    @foreach($communities as $community)
                        <option value="{{ $community->id }}" {{ old('community_id', $selectedCommunity) == $community->id ? 'selected' : '' }}>{{ $community->name }}</option>
                    @endforeach
                </select>
                @error('community_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Kolaborasi *</label>
                <select name="collaboration_type" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('collaboration_type') border-komuna-danger @enderror">
                    <option value="">Pilih Tipe</option>
                    <option value="free_collaboration" {{ old('collaboration_type') === 'free_collaboration' ? 'selected' : '' }}>Free Collaboration</option>
                    <option value="paid_collaboration" {{ old('collaboration_type') === 'paid_collaboration' ? 'selected' : '' }}>Paid Collaboration</option>
                    <option value="sponsorship" {{ old('collaboration_type') === 'sponsorship' ? 'selected' : '' }}>Sponsorship</option>
                    <option value="csr_donation" {{ old('collaboration_type') === 'csr_donation' ? 'selected' : '' }}>CSR Donation</option>
                    <option value="tap_in_event" {{ old('collaboration_type') === 'tap_in_event' ? 'selected' : '' }}>Tap-in Event</option>
                </select>
                @error('collaboration_type') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Judul *</label>
                <input type="text" name="title" value="{{ old('title') }}" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('title') border-komuna-danger @enderror">
                @error('title') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Budget (Rp)</label>
                <input type="number" name="budget" value="{{ old('budget') }}" min="0"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Kosongkan jika tidak ada budget">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Event</label>
                <input type="date" name="event_date" value="{{ old('event_date') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Person</label>
                <input type="text" name="contact_person" value="{{ old('contact_person') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Email</label>
                <input type="email" name="contact_email" value="{{ old('contact_email') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Contact Phone</label>
                <input type="text" name="contact_phone" value="{{ old('contact_phone') }}"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Proposal / Detail Kolaborasi</label>
            <textarea name="proposal" rows="6"
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="Jelaskan proposal kolaborasi Anda secara detail...">{{ old('proposal') }}</textarea>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Kirim Pengajuan
            </button>
            <a href="{{ route('brand.collaborations.index') }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
