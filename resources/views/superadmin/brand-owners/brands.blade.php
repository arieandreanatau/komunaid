@extends('layouts.admin')

@php $pageTitle = 'Brands - ' . $user->name @endphp


@section('content')
<div class="mb-6">
    <a href="{{ route('superadmin.brand-owners.show', $user) }}" class="inline-flex items-center gap-1.5 text-sm text-[#126BFF] hover:text-[#0B2D89] font-medium transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Detail
    </a>
</div>

<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">Brands - {{ $user->name }}</h1>
    <p class="text-[#64748B] mt-1">Semua brand yang dimiliki oleh {{ $user->name }}</p>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Name</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Industry</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Status</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Created At</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
                @forelse($brands as $brand)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-5 py-4">
                            <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-sm font-semibold text-[#0F172A] hover:text-[#126BFF] transition">{{ $brand->name }}</a>
                        </td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $brand->industry ?? '-' }}</td>
                        <td class="px-5 py-4">@include('superadmin.partials.status-badge', ['status' => $brand->status])</td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $brand->created_at->format('d M Y') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="px-5 py-16 text-center">
                            <svg class="mx-auto h-12 w-12 text-[#64748B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                            <h3 class="mt-2 text-sm font-medium text-[#0F172A]">Tidak ada brand</h3>
                            <p class="mt-1 text-sm text-[#64748B]">User ini belum memiliki brand.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($brands->hasPages())
        <div class="px-5 py-4 border-t border-[#E2E8F0]">{{ $brands->withQueryString()->links() }}</div>
    @endif
</div>
@endsection
