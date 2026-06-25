@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-komuna-text">Ajukan Role</h2>
        <p class="text-komuna-muted mt-1">
            @if($role === 'community_owner')
                Ajukan diri sebagai Community Owner
            @elseif($role === 'brand_owner')
                Ajukan diri sebagai Brand Owner
            @else
                Ajukan diri sebagai Company Owner
            @endif
        </p>
    </div>

    @if($errors->any())
        <div class="mb-4">
            <div class="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium bg-komuna-danger-soft border-komuna-danger text-komuna-danger">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                <ul class="list-disc list-inside">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        </div>
    @endif

    <form method="POST" action="{{ route('onboarding.role-request.store') }}">
        @csrf
        <input type="hidden" name="requested_role" value="{{ $role }}">

        <div class="space-y-4">
            @if($role === 'community_owner')
                <div>
                    <label for="community_name" class="block text-sm font-medium text-komuna-text">Nama Komunitas Awal <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="community_name" id="community_name" value="{{ old('community_name') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Nama komunitas yang ingin dibuat">
                    @error('community_name')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="community_category" class="block text-sm font-medium text-komuna-text">Kategori Komunitas <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="community_category" id="community_category" value="{{ old('community_category') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Contoh: Teknologi, Olahraga, Seni">
                    @error('community_category')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="community_description" class="block text-sm font-medium text-komuna-text">Deskripsi Komunitas <span class="text-komuna-muted">(opsional)</span></label>
                    <textarea name="community_description" id="community_description" rows="3"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Ceritakan tentang komunitas yang ingin dibuat">{{ old('community_description') }}</textarea>
                    @error('community_description')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="community_regional" class="block text-sm font-medium text-komuna-text">Regional <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="community_regional" id="community_regional" value="{{ old('community_regional') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Contoh: Jakarta, Bandung, Surabaya">
                    @error('community_regional')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>
            @elseif($role === 'brand_owner')
                <div>
                    <label for="brand_name" class="block text-sm font-medium text-komuna-text">Nama Brand Awal <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="brand_name" id="brand_name" value="{{ old('brand_name') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Nama brand yang ingin dikelola">
                    @error('brand_name')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="brand_industry" class="block text-sm font-medium text-komuna-text">Industri <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="brand_industry" id="brand_industry" value="{{ old('brand_industry') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Contoh: F&B, Fashion, Teknologi">
                    @error('brand_industry')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="brand_website" class="block text-sm font-medium text-komuna-text">Website / Instagram <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="brand_website" id="brand_website" value="{{ old('brand_website') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="https://...">
                    @error('brand_website')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>
            @elseif($role === 'company_owner')
                <div>
                    <label for="company_name" class="block text-sm font-medium text-komuna-text">Nama Perusahaan Awal <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="company_name" id="company_name" value="{{ old('company_name') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Nama perusahaan yang ingin dikelola">
                    @error('company_name')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="company_industry" class="block text-sm font-medium text-komuna-text">Industri <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="company_industry" id="company_industry" value="{{ old('company_industry') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="Contoh: Teknologi, Retail, Manufaktur">
                    @error('company_industry')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="company_website" class="block text-sm font-medium text-komuna-text">Website <span class="text-komuna-muted">(opsional)</span></label>
                    <input type="text" name="company_website" id="company_website" value="{{ old('company_website') }}"
                        class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                        placeholder="https://...">
                    @error('company_website')
                        <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                    @enderror
                </div>
            @endif

            <div>
                <label for="motivation" class="block text-sm font-medium text-komuna-text">Alasan / Motivasi <span class="text-komuna-muted">(opsional)</span></label>
                <textarea name="motivation" id="motivation" rows="3"
                    class="mt-1 block w-full rounded-xl border-komuna-border shadow-sm focus:ring-komuna-blue focus:border-komuna-blue border px-4 py-2.5"
                    placeholder="Ceritakan mengapa kamu ingin menjadi {{ str_replace('_', ' ', $role) }}">{{ old('motivation') }}</textarea>
                @error('motivation')
                    <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                @enderror
            </div>

            <button type="submit" class="w-full bg-komuna-blue text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
                Kirim Pengajuan
            </button>
        </div>
    </form>

    <div class="mt-6 text-center">
        <a href="{{ route('onboarding') }}" class="text-sm text-komuna-muted hover:text-komuna-text">
            &larr; Kembali ke Pilihan Peran
        </a>
    </div>
</div>
@endsection
