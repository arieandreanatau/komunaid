@extends('layouts.public')

@section('title', 'Hubungi Kami — KomunaID')
@section('meta_description')
<meta name="description" content="Hubungi tim KomunaID untuk pertanyaan, saran, atau kolaborasi. Kami siap membantu Anda.">
@endsection

@section('content')
<section class="bg-komuna-gradient-hero text-white py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-4">Hubungi Kami</h1>
        <p class="text-blue-200 text-lg">Kami senang mendengar dari Anda. Kirim saran atau pertanyaan kapan saja.</p>
    </div>
</section>

<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
            <h2 class="text-xl font-bold text-komuna-text mb-4">Informasi Kontak</h2>
            <p class="text-komuna-muted mb-6">Hubungi kami melalui saluran berikut atau kirim saran melalui form di sebelah.</p>
            @include('public.partials.contact-links')
            <div class="mt-6 p-4 bg-komuna-light rounded-xl border border-komuna-border-soft">
                <p class="text-sm text-komuna-muted">Masukan Anda akan ditinjau oleh tim KomunaID. Kami berusaha merespon dalam 1-3 hari kerja.</p>
            </div>
        </div>
        <div>
            <h2 class="text-xl font-bold text-komuna-text mb-4">Kirim Saran</h2>
            <form action="{{ route('suggestions.store') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label for="name" class="block text-sm font-medium text-komuna-text mb-1">Nama <span class="text-komuna-light-text">(opsional)</span></label>
                    <input type="text" name="name" id="name" value="{{ old('name', auth()->user()->name ?? '') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm text-komuna-text placeholder-komuna-light-text px-4 py-2.5" placeholder="Nama kamu">
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-komuna-text mb-1">Email <span class="text-komuna-light-text">(opsional)</span></label>
                    <input type="email" name="email" id="email" value="{{ old('email', auth()->user()->email ?? '') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm text-komuna-text placeholder-komuna-light-text px-4 py-2.5" placeholder="nama@email.com">
                </div>
                <div>
                    <label for="subject" class="block text-sm font-medium text-komuna-text mb-1">Subjek <span class="text-komuna-light-text">(opsional)</span></label>
                    <input type="text" name="subject" id="subject" value="{{ old('subject') }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm text-komuna-text placeholder-komuna-light-text px-4 py-2.5" placeholder="Subjek pesan">
                </div>
                <div>
                    <label for="message" class="block text-sm font-medium text-komuna-text mb-1">Pesan <span class="text-komuna-danger">*</span></label>
                    <textarea name="message" id="message" rows="5" required class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm text-komuna-text placeholder-komuna-light-text px-4 py-2.5" placeholder="Tulis saran atau pesan Anda di sini...">{{ old('message') }}</textarea>
                    @error('message')
                        <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
                <button type="submit" class="w-full bg-komuna-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-komuna-navy transition focus:ring-2 focus:ring-komuna-blue focus:ring-offset-2">
                    Kirim Saran
                </button>
            </form>
        </div>
    </div>
</section>
@endsection
