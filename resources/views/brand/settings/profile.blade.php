@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Pengaturan Profile</h1>
    <p class="text-komuna-muted">Perbarui informasi profile Anda.</p>
</div>

<form method="POST" action="{{ route('brand.settings.profile.update') }}" class="max-w-xl">
    @csrf
    @method('PUT')
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 space-y-4">
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Nama <span class="text-komuna-danger">*</span></label>
            <input type="text" name="name" value="{{ old('name', $user->name) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required>
            @error('name') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Email <span class="text-komuna-danger">*</span></label>
            <input type="email" name="email" value="{{ old('email', $user->email) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue" required>
            @error('email') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Telepon</label>
            <input type="text" name="phone" value="{{ old('phone', $user->phone) }}" class="w-full border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">
            @error('phone') <p class="text-komuna-danger text-xs mt-1">{{ $message }}</p> @enderror
        </div>
    </div>
    <div class="mt-6">
        <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Simpan Perubahan</button>
    </div>
</form>
@endsection
