@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">{{ $company->name }}</h1>
        <p class="text-komuna-muted">Detail perusahaan.</p>
    </div>
    <div class="flex items-center gap-2">
        <a href="{{ route('company-owner.companies.edit', $company) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Edit</a>
        <a href="{{ route('company-owner.companies.brands.index', $company) }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Kelola Brand</a>
    </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-bold text-komuna-text mb-4">Informasi Perusahaan</h2>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Nama</span><span class="font-medium text-komuna-text">{{ $company->name }}</span></div>
                @if($company->legal_name)<div class="flex justify-between text-sm"><span class="text-komuna-muted">Legal Name</span><span class="font-medium text-komuna-text">{{ $company->legal_name }}</span></div>@endif
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Industri</span><span class="font-medium text-komuna-text">{{ $company->industry ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Status</span><span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $company->status === 'active' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-text' }}">{{ ucfirst($company->status) }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Verified</span><span class="font-medium text-komuna-text">{{ $company->is_verified ? 'Yes' : 'No' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Email</span><span class="font-medium text-komuna-text">{{ $company->email ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Telepon</span><span class="font-medium text-komuna-text">{{ $company->phone ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Kota</span><span class="font-medium text-komuna-text">{{ $company->city ?? '-' }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Provinsi</span><span class="font-medium text-komuna-text">{{ $company->province ?? '-' }}</span></div>
            </div>
        </div>
        @if($company->description)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
                <h2 class="text-lg font-bold text-komuna-text mb-3">Deskripsi</h2>
                <p class="text-komuna-muted text-sm whitespace-pre-wrap">{{ $company->description }}</p>
            </div>
        @endif
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Brand di Bawah Perusahaan</h3>
            @if($company->brands->count() > 0)
                <div class="space-y-2">
                    @foreach($company->brands as $brand)
                        <div class="flex items-center gap-2 text-sm">
                            <span class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-xs font-bold">{{ substr($brand->name, 0, 1) }}</span>
                            <span class="text-komuna-text">{{ $brand->name }}</span>
                            <span class="px-1.5 py-0.5 rounded text-xs {{ $brand->status === 'active' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted' }}">{{ ucfirst($brand->status) }}</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-komuna-muted text-sm">Belum ada brand.</p>
            @endif
            <a href="{{ route('company-owner.companies.brands.index', $company) }}" class="block mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">Kelola Brand &rarr;</a>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Aksi</h3>
            <div class="space-y-2">
                <a href="{{ route('company-owner.companies.edit', $company) }}" class="block text-center bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Edit Perusahaan</a>
                <a href="{{ route('company-owner.companies.brands.create', $company) }}" class="block text-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Tambah Brand</a>
                <form method="POST" action="{{ route('company-owner.companies.archive', $company) }}" onsubmit="return confirm('Arsipkan perusahaan ini?')">
                    @csrf
                    <button type="submit" class="w-full bg-komuna-danger-soft text-komuna-danger px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition">Arsipkan</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
