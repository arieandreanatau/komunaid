@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Buat Event Baru</h1>
    <p class="text-komuna-muted">Isi form berikut untuk membuat event baru.</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <form action="{{ route('community.events.store') }}" method="POST" class="space-y-6">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Komunitas *</label>
                <select name="community_id" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('community_id') border-komuna-danger @enderror">
                    <option value="">Pilih Komunitas</option>
                    @foreach($communities as $community)
                        <option value="{{ $community->id }}" {{ old('community_id') == $community->id ? 'selected' : '' }}>{{ $community->name }}</option>
                    @endforeach
                </select>
                @error('community_id') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Judul Event *</label>
                <input type="text" name="title" value="{{ old('title') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('title') border-komuna-danger @enderror">
                @error('title') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Event *</label>
                <select name="event_type" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="free" {{ old('event_type') === 'free' ? 'selected' : '' }}>Free</option>
                    <option value="paid" {{ old('event_type') === 'paid' ? 'selected' : '' }}>Paid</option>
                    <option value="collaboration" {{ old('event_type') === 'collaboration' ? 'selected' : '' }}>Collaboration</option>
                    <option value="volunteer" {{ old('event_type') === 'volunteer' ? 'selected' : '' }}>Volunteer</option>
                    <option value="charity" {{ old('event_type') === 'charity' ? 'selected' : '' }}>Charity</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Lokasi *</label>
                <select name="location_type" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="online" {{ old('location_type') === 'online' ? 'selected' : '' }}>Online</option>
                    <option value="offline" {{ old('location_type') === 'offline' ? 'selected' : '' }}>Offline</option>
                    <option value="hybrid" {{ old('location_type') === 'hybrid' ? 'selected' : '' }}>Hybrid</option>
                </select>
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-komuna-text mb-1">Alamat Lokasi</label>
                <input type="text" name="location_address" value="{{ old('location_address') }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" placeholder="URL meet atau alamat lokasi">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Mulai *</label>
                <input type="datetime-local" name="start_datetime" value="{{ old('start_datetime') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Tanggal Selesai *</label>
                <input type="datetime-local" name="end_datetime" value="{{ old('end_datetime') }}" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Kapasitas</label>
                <input type="number" name="capacity" value="{{ old('capacity') }}" min="1" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" placeholder="Kosongkan jika tanpa batas">
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Status Registrasi *</label>
                <select name="registration_status" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="open" {{ old('registration_status') === 'open' ? 'selected' : '' }}>Open</option>
                    <option value="closed" {{ old('registration_status') === 'closed' ? 'selected' : '' }}>Closed</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-komuna-text mb-1">Visibilitas *</label>
                <select name="visibility" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                    <option value="public" {{ old('visibility') === 'public' ? 'selected' : '' }}>Public</option>
                    <option value="private" {{ old('visibility') === 'private' ? 'selected' : '' }}>Private</option>
                </select>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Deskripsi</label>
            <textarea name="description" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">{{ old('description') }}</textarea>
        </div>

        <div id="price-section" class="hidden border-t border-komuna-border pt-6">
            <h3 class="text-sm font-semibold text-komuna-text mb-4">Pengaturan Harga (Paid Event)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Harga (Rp) *</label>
                    <input type="number" name="price" value="{{ old('price') }}" min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Platform Fee (Rp)</label>
                    <input type="number" name="platform_fee" value="{{ old('platform_fee', 0) }}" min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Admin Fee (Rp)</label>
                    <input type="number" name="admin_fee" value="{{ old('admin_fee', 0) }}" min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                </div>
            </div>

            <div class="mt-4 flex items-center gap-4">
                <label class="flex items-center gap-2">
                    <input type="checkbox" name="discount_enabled" value="1" {{ old('discount_enabled') ? 'checked' : '' }} class="rounded border-komuna-border text-komuna-success focus:ring-komuna-blue">
                    <span class="text-sm font-medium text-komuna-text">Aktifkan Diskon</span>
                </label>
            </div>

            <div id="discount-section" class="hidden mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Tipe Diskon</label>
                    <select name="discount_type" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                        <option value="percentage">Persen (%)</option>
                        <option value="fixed">Fixed (Rp)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Nilai Diskon</label>
                    <input type="number" name="discount_value" value="{{ old('discount_value') }}" min="0" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                </div>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Buat Event
            </button>
            <a href="{{ route('community.events.index') }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
        </div>
    </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const eventTypeSelect = document.querySelector('select[name="event_type"]');
    const priceSection = document.getElementById('price-section');
    const discountCheckbox = document.querySelector('input[name="discount_enabled"]');
    const discountSection = document.getElementById('discount-section');

    function togglePriceSection() {
        priceSection.classList.toggle('hidden', eventTypeSelect.value !== 'paid');
    }

    function toggleDiscountSection() {
        discountSection.classList.toggle('hidden', !discountCheckbox.checked);
    }

    eventTypeSelect.addEventListener('change', togglePriceSection);
    discountCheckbox.addEventListener('change', toggleDiscountSection);

    togglePriceSection();
    toggleDiscountSection();
});
var bp=document.getElementById('banner-preview');document.querySelector('input[name="banner"]').onchange=function(e){if(e.target.files[0]){var r=new FileReader();r.onload=function(ev){bp.innerHTML='<img src='+ev.target.result+' class="w-full h-48 object-cover rounded-lg">'};r.readAsDataURL(e.target.files[0])}}
</script>
@endsection
