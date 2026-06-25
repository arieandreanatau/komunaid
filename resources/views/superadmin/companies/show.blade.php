@php $pageTitle = 'Detail Company' @endphp

@extends('layouts.admin')

@section('content')
<div class="mb-6">
    <a href="{{ route('superadmin.companies.index') }}" class="inline-flex items-center gap-1.5 text-sm text-[#126BFF] hover:text-[#0B2D89] font-medium transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Companies
    </a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div class="flex items-center gap-4 mb-6">
            <div class="w-14 h-14 rounded-xl bg-[#0B2D89]/10 text-[#0B2D89] flex items-center justify-center text-xl font-bold">{{ strtoupper(substr($company->name, 0, 1)) }}</div>
            <div>
                <h2 class="text-lg font-bold text-[#0F172A]">{{ $company->name }}</h2>
                @if($company->is_verified)
                    <span class="inline-flex items-center gap-1 text-xs text-[#16A34A] font-medium"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Verified</span>
                @endif
            </div>
        </div>
        <dl class="space-y-4 mb-6">
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Owner</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $company->owner->name ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Industry</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $company->industry ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">City</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $company->city ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Address</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $company->address ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Phone</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $company->phone ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Website</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $company->website ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Status</dt>
                <dd class="mt-0.5">@include('superadmin.partials.status-badge', ['status' => $company->status ?? 'active'])</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Created</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $company->created_at->format('d M Y H:i') }}</dd>
            </div>
        </dl>
        <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-[#EEF7FF] rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-[#0B2D89]">{{ $brandsCount }}</div>
                <div class="text-xs text-[#64748B] mt-1">Brands</div>
            </div>
        </div>
    </div>
    <div class="lg:col-span-2 space-y-6">
        @if($company->description)
            <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
                <h3 class="text-lg font-bold text-[#0F172A] mb-2">Description</h3>
                <p class="text-sm text-[#64748B]">{{ $company->description }}</p>
            </div>
        @endif
        <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 class="text-lg font-bold text-[#0F172A] mb-4">Brands ({{ $brandsCount }})</h3>
            @if(isset($company->brands) && $company->brands->isNotEmpty())
                <div class="space-y-2">
                    @foreach($company->brands as $brand)
                        <div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg border border-[#E2E8F0]">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-[#126BFF] text-white flex items-center justify-center text-xs font-bold">{{ strtoupper(substr($brand->name, 0, 1)) }}</div>
                                <div>
                                    <p class="text-sm font-medium text-[#0F172A]">{{ $brand->name }}</p>
                                    <p class="text-xs text-[#64748B]">{{ $brand->industry ?? '-' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                @include('superadmin.partials.status-badge', ['status' => $brand->status])
                                <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-xs text-[#126BFF] hover:text-[#0B2D89] font-medium">Detail</a>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-sm text-[#64748B] text-center py-6">Belum ada brand.</p>
            @endif
        </div>
    </div>
</div>
@endsection
