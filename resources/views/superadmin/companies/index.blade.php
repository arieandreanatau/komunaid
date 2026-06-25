@php $pageTitle = 'Companies' @endphp

@extends('layouts.admin')

@section('content')
<div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
        <h1 class="text-2xl font-bold text-[#0F172A]">Companies</h1>
        <p class="text-[#64748B] mt-1">Kelola semua perusahaan di platform</p>
    </div>
    <a href="{{ route('superadmin.companies.export', request()->query()) }}"
       class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#0B2D89] text-sm font-medium rounded-xl hover:bg-[#EEF7FF] transition shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Export CSV
    </a>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-6">
    <form method="GET" action="{{ route('superadmin.companies.index') }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-medium text-[#64748B] mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nama perusahaan..."
                   class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none transition">
        </div>
        <div class="min-w-[150px]">
            <label class="block text-xs font-medium text-[#64748B] mb-1">Status</label>
            <select name="status" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none">
                <option value="">Semua Status</option>
                <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactive</option>
            </select>
        </div>
        <button type="submit" class="px-4 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">Filter</button>
        @if(request()->hasAny(['search', 'status']))
            <a href="{{ route('superadmin.companies.index') }}" class="px-4 py-2 bg-komuna-border-soft text-[#64748B] text-sm font-medium rounded-lg hover:bg-komuna-border transition">Reset</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Name</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Owner</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Industry</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">City</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Status</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Verified</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
                @forelse($companies as $company)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-5 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-lg bg-[#0B2D89]/10 text-[#0B2D89] flex items-center justify-center text-sm font-bold flex-shrink-0">{{ strtoupper(substr($company->name, 0, 1)) }}</div>
                                <a href="{{ route('superadmin.companies.show', $company) }}" class="text-sm font-semibold text-[#0F172A] hover:text-[#126BFF] transition">{{ $company->name }}</a>
                            </div>
                        </td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $company->owner->name ?? '-' }}</td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $company->industry ?? '-' }}</td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $company->city ?? '-' }}</td>
                        <td class="px-5 py-4">@include('superadmin.partials.status-badge', ['status' => $company->status ?? 'active'])</td>
                        <td class="px-5 py-4">
                            @if($company->is_verified)
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A]"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Verified</span>
                            @else
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-komuna-border-soft text-[#64748B]">Unverified</span>
                            @endif
                        </td>
                        <td class="px-5 py-4">
                            <a href="{{ route('superadmin.companies.show', $company) }}" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#126BFF] bg-[#126BFF]/5 rounded-lg hover:bg-[#126BFF]/10 transition">View</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-5 py-16 text-center">
                            <svg class="mx-auto h-12 w-12 text-[#64748B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            <h3 class="mt-2 text-sm font-medium text-[#0F172A]">Tidak ada perusahaan ditemukan</h3>
                            <p class="mt-1 text-sm text-[#64748B]">Tidak ada data yang cocok dengan filter pencarian Anda.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($companies->hasPages())
        <div class="px-5 py-4 border-t border-[#E2E8F0]">{{ $companies->withQueryString()->links() }}</div>
    @endif
</div>
@endsection
