@extends('layouts.dashboard')
@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Dashboard Company Owner</h1>
    <p class="text-komuna-muted">Selamat datang, {{ $user->name }}!</p>
</div>

<x-alert />

<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-light rounded-xl flex items-center justify-center text-komuna-blue font-bold text-lg">🏢</div>
            <div><p class="text-xs text-komuna-muted">Perusahaan</p><p class="text-2xl font-bold text-komuna-text">{{ $stats['total_companies'] }}</p></div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">✓</div>
            <div><p class="text-xs text-komuna-muted">Active</p><p class="text-2xl font-bold text-komuna-text">{{ $stats['active_companies'] }}</p></div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-info-soft rounded-xl flex items-center justify-center text-komuna-info font-bold text-lg">🏷</div>
            <div><p class="text-xs text-komuna-muted">Brand</p><p class="text-2xl font-bold text-komuna-text">{{ $stats['total_brands_under_companies'] }}</p></div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-komuna-success-soft rounded-xl flex items-center justify-center text-komuna-success font-bold text-lg">🤝</div>
            <div><p class="text-xs text-komuna-muted">Proposal</p><p class="text-2xl font-bold text-komuna-text">{{ $stats['total_proposals'] }}</p></div>
        </div>
    </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-komuna-text">Perusahaan Saya</h2>
            <a href="{{ route('company-owner.companies.create') }}" class="bg-komuna-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition">+ Buat Perusahaan</a>
        </div>
        @if(isset($latestCompanies) && $latestCompanies->count() > 0)
            <div class="space-y-3">
                @foreach($latestCompanies as $company)
                    <a href="{{ route('company-owner.companies.show', $company) }}" class="block bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 hover:shadow-md transition">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-komuna-blue to-komuna-cyan rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                @if($company->logo_path)
                                    <img src="{{ Storage::url($company->logo_path) }}" alt="" class="w-full h-full object-cover">
                                @else
                                    {{ substr($company->name, 0, 1) }}
                                @endif
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-komuna-text text-sm truncate">{{ $company->name }}</h3>
                                    <x-status-badge :status="$company->status" />
                                    @if($company->is_verified)<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-komuna-light text-komuna-blue">Verified</span>@endif
                                </div>
                                <p class="text-xs text-komuna-muted mt-1">{{ $company->industry ?? '-' }} &middot; {{ $company->brands_count ?? 0 }} brands</p>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        @else
            <x-empty-state
                title="Belum Ada Perusahaan"
                description="Buat profil perusahaan pertama Anda."
                action-url="{{ route('company-owner.companies.create') }}"
                action-label="Buat Perusahaan"
            />
        @endif
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Akun</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-komuna-muted">Nama</span><span class="font-medium text-komuna-text">{{ $user->name }}</span></div>
                <div class="flex justify-between"><span class="text-komuna-muted">Role</span><span class="font-medium text-komuna-text">Company Owner</span></div>
            </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-2">Ringkasan</h3>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Proposal Draft</span><span class="font-medium text-komuna-text">{{ $stats['proposal_draft'] }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Proposal Sent</span><span class="font-medium text-komuna-text">{{ $stats['proposal_sent'] }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-komuna-muted">Proposal Accepted</span><span class="font-medium text-komuna-text">{{ $stats['proposal_accepted'] }}</span></div>
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <a href="{{ route('company-owner.companies.create') }}" class="bg-komuna-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition text-center">Buat Perusahaan</a>
            <a href="{{ route('company-owner.collaborations.create') }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition text-center">Ajukan Kolaborasi</a>
        </div>
    </div>
</div>
@endsection
