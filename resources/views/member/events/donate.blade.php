@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <a href="{{ route('member.events.show', $event) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">&larr; Kembali ke Event</a>
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text mt-2">Donasi Event</h1>
    <p class="text-komuna-muted">{{ $event->title }} - {{ $event->community->name }}</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Form Donasi</h2>
            <form action="{{ route('member.events.donate.store', $event) }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                @csrf

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-komuna-text mb-1">Nama Donor</label>
                        <input type="text" name="donor_name" value="{{ old('donor_name', auth()->user()->name) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('donor_name') border-komuna-danger @enderror">
                        @error('donor_name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-komuna-text mb-1">Email</label>
                        <input type="email" name="donor_email" value="{{ old('donor_email', auth()->user()->email) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('donor_email') border-komuna-danger @enderror">
                        @error('donor_email') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Jumlah Donasi (Rp) *</label>
                    <input type="number" name="amount" value="{{ old('amount') }}" min="1000" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('amount') border-komuna-danger @enderror" placeholder="Minimal Rp 1.000">
                    @error('amount') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Metode Pembayaran</label>
                    <select name="payment_method" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                        <option value="">Pilih Metode</option>
                        <option value="bank_transfer" {{ old('payment_method') === 'bank_transfer' ? 'selected' : '' }}>Transfer Bank</option>
                        <option value="ewallet" {{ old('payment_method') === 'ewallet' ? 'selected' : '' }}>E-Wallet</option>
                        <option value="cash" {{ old('payment_method') === 'cash' ? 'selected' : '' }}>Tunai</option>
                        <option value="other" {{ old('payment_method') === 'other' ? 'selected' : '' }}>Lainnya</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Bukti Transfer *</label>
                    <input type="file" name="proof" accept="image/*,.pdf" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue @error('proof') border-komuna-danger @enderror">
                    <p class="text-xs text-komuna-muted mt-1">Format: JPG, JPEG, PNG, WebP, PDF. Maks 4MB.</p>
                    @error('proof') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-komuna-text mb-1">Pesan (Opsional)</label>
                    <textarea name="message" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" placeholder="Tulis pesan untuk donasi Anda...">{{ old('message') }}</textarea>
                </div>

                <div class="flex items-center gap-4">
                    <button type="submit" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                        Kirim Donasi
                    </button>
                    <a href="{{ route('member.events.show', $event) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Batal</a>
                </div>
            </form>
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Info Event</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Event</span>
                    <span class="font-medium text-komuna-text">{{ Str::limit($event->title, 30) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Komunitas</span>
                    <span class="font-medium text-komuna-text">{{ $event->community->name }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Tanggal</span>
                    <span class="font-medium text-komuna-text">{{ $event->start_datetime->format('d M Y') }}</span>
                </div>
            </div>
        </div>

        <div class="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
            <h3 class="font-semibold text-komuna-success mb-2">Catatan Donasi</h3>
            <ul class="text-sm text-emerald-700 space-y-1">
                <li>- Minimal donasi Rp 1.000</li>
                <li>- Upload bukti transfer wajib</li>
                <li>- Donasi akan diverifikasi oleh panitia</li>
                <li>- Data Anda aman dan tidak dipublikasikan</li>
            </ul>
        </div>
    </div>
</div>
@endsection
