@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Edit Event</h1>
        <p class="text-komuna-muted">{{ $event->title }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.events.update', $event) }}" method="POST" class="space-y-6">
        @csrf
        @method('PUT')

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-komuna-text mb-1">Judul Event *</label>
                <input type="text" name="title" value="{{ old('title', $event->title) }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Event</label>
                <select name="event_type" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="free" {{ old('event_type', $event->event_type) === 'free' ? 'selected' : '' }}>Free</option>
                    <option value="paid" {{ old('event_type', $event->event_type) === 'paid' ? 'selected' : '' }}>Paid</option>
                    <option value="collaboration" {{ old('event_type', $event->event_type) === 'collaboration' ? 'selected' : '' }}>Collaboration</option>
                    <option value="volunteer" {{ old('event_type', $event->event_type) === 'volunteer' ? 'selected' : '' }}>Volunteer</option>
                    <option value="charity" {{ old('event_type', $event->event_type) === 'charity' ? 'selected' : '' }}>Charity</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Lokasi</label>
                <select name="location_type" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="online" {{ old('location_type', $event->location_type) === 'online' ? 'selected' : '' }}>Online</option>
                    <option value="offline" {{ old('location_type', $event->location_type) === 'offline' ? 'selected' : '' }}>Offline</option>
                    <option value="hybrid" {{ old('location_type', $event->location_type) === 'hybrid' ? 'selected' : '' }}>Hybrid</option>
                </select>
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-komuna-text mb-1">Alamat Lokasi</label>
                <input type="text" name="location_address" value="{{ old('location_address', $event->location_address) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Mulai</label>
                <input type="datetime-local" name="start_datetime" value="{{ old('start_datetime', $event->start_datetime->format('Y-m-d\TH:i')) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Selesai</label>
                <input type="datetime-local" name="end_datetime" value="{{ old('end_datetime', $event->end_datetime->format('Y-m-d\TH:i')) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kapasitas</label>
                <input type="number" name="capacity" value="{{ old('capacity', $event->capacity) }}" min="1" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Status Registrasi</label>
                <select name="registration_status" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="open" {{ old('registration_status', $event->registration_status) === 'open' ? 'selected' : '' }}>Open</option>
                    <option value="closed" {{ old('registration_status', $event->registration_status) === 'closed' ? 'selected' : '' }}>Closed</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Visibilitas</label>
                <select name="visibility" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="public" {{ old('visibility', $event->visibility) === 'public' ? 'selected' : '' }}>Public</option>
                    <option value="private" {{ old('visibility', $event->visibility) === 'private' ? 'selected' : '' }}>Private</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Harga (Rp)</label>
                <input type="number" name="price" value="{{ old('price', $event->price) }}" min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">EO By Platform</label>
                <select name="eo_by_platform" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="0" {{ old('eo_by_platform', $event->eo_by_platform) ? '' : 'selected' }}>Tidak</option>
                    <option value="1" {{ old('eo_by_platform', $event->eo_by_platform) ? 'selected' : '' }}>Ya</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">EO Fee (Rp)</label>
                <input type="number" name="eo_fee" value="{{ old('eo_fee', $event->eo_fee) }}" min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>
        </div>

<div class="md:col-span-2">
                <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi Singkat</label>
                <textarea name="short_description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue">{{ old('short_description', $event->short_description) }}</textarea>
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-komuna-text mb-1">Banner</label>
                @if($event->banner)
                    <img src="{{ asset('storage/' . $event->banner) }}" class="w-full h-48 object-cover rounded-lg mb-2">
                @endif
                <input type="file" name="banner" accept="image/*" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Event Master</label>
                <select name="type_id" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue"><option value="">Pilih</option>@foreach($eventTypes as $type)<option value="{{ $type->id }}" {{ old('type_id', $event->type_id) == $type->id ? 'selected' : '' }}>{{ $type->name }}</option>@endforeach</select>
            </div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Nama Lokasi</label><input type="text" name="location_name" value="{{ old('location_name', $event->location_name) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Kota</label><input type="text" name="city" value="{{ old('city', $event->city) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Provinsi</label><input type="text" name="province" value="{{ old('province', $event->province) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">URL Online</label><input type="url" name="online_url" value="{{ old('online_url', $event->online_url) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue"></div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Registration Type</label><select name="registration_type" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue"><option value="open" {{ old('registration_type', $event->registration_type) === 'open' ? 'selected' : '' }}>Terbuka</option><option value="approval_required" {{ old('registration_type', $event->registration_type) === 'approval_required' ? 'selected' : '' }}>Persetujuan</option><option value="invite_only" {{ old('registration_type', $event->registration_type) === 'invite_only' ? 'selected' : '' }}>Undangan</option></select></div>
            <div class="flex items-center gap-6">
                <label class="flex items-center gap-2"><input type="checkbox" name="is_charity" value="1" {{ old('is_charity', $event->is_charity) ? 'checked' : '' }} class="rounded border-komuna-border text-komuna-success"><span class="text-sm font-medium text-komuna-text">Charity</span></label>
                <label class="flex items-center gap-2"><input type="checkbox" name="is_open_volunteer" value="1" {{ old('is_open_volunteer', $event->is_open_volunteer) ? 'checked' : '' }} class="rounded border-komuna-border text-komuna-success"><span class="text-sm font-medium text-komuna-text">Volunteer</span></label>
                <label class="flex items-center gap-2"><input type="checkbox" name="is_open_donation" value="1" {{ old('is_open_donation', $event->is_open_donation) ? 'checked' : '' }} class="rounded border-komuna-border text-komuna-success"><span class="text-sm font-medium text-komuna-text">Donasi</span></label>
            </div>
            <div><label class="block text-sm font-medium text-komuna-text mb-1">Status</label><select name="status" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue"><option value="draft" {{ old('status', $event->status) === 'draft' ? 'selected' : '' }}>Draft</option><option value="published" {{ old('status', $event->status) === 'published' ? 'selected' : '' }}>Published</option></select></div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description', $event->description) }}</textarea>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Simpan Perubahan
            </button>
            <a href="{{ route('community.events.show', $event) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>
@endsection
