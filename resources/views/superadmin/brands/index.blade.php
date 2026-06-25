@extends('layouts.admin')
@php $pageTitle = 'Brands' @endphp

@section('content')
<div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
        <h1 class="text-2xl font-bold text-[#0F172A]">Brands</h1>
        <p class="text-[#64748B] mt-1">Kelola semua brand di platform</p>
    </div>
    <a href="{{ route('superadmin.brands.export', request()->query()) }}"
       class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#0B2D89] text-sm font-medium rounded-xl hover:bg-[#EEF7FF] transition shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Export CSV
    </a>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-6">
    <form method="GET" action="{{ route('superadmin.brands.index') }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari brand..."
                   class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none">
        </div>
        <div class="min-w-[150px]">
            <label class="block text-xs font-medium text-[#64748B] mb-1">Status</label>
            <select name="status" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none">
                <option value="">Semua</option>
                <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="approved" {{ request('status') === 'approved' ? 'selected' : '' }}>Approved</option>
                <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Rejected</option>
                <option value="suspended" {{ request('status') === 'suspended' ? 'selected' : '' }}>Suspended</option>
                <option value="banned" {{ request('status') === 'banned' ? 'selected' : '' }}>Banned</option>
            </select>
        </div>
        <button type="submit" class="px-4 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">Filter</button>
        @if(request()->hasAny(['search', 'status']))
            <a href="{{ route('superadmin.brands.index') }}" class="px-4 py-2 bg-komuna-border-soft text-[#64748B] text-sm font-medium rounded-lg hover:bg-komuna-border transition">Reset</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase">Name</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase">Owner</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase">Industry</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
                @forelse($brands as $brand)
                    <tr class="hover:bg-[#EEF7FF]/30 transition">
                        <td class="px-5 py-3.5">
                            <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-sm font-semibold text-[#0B2D89] hover:text-[#126BFF] transition">{{ $brand->name }}</a>
                        </td>
                        <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $brand->owner->name ?? '-' }}</td>
                        <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $brand->industry ?? '-' }}</td>
                        <td class="px-5 py-3.5">
                            @include('superadmin.partials.status-badge', ['status' => $brand->status])
                        </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <a href="{{ route('superadmin.brands.show', $brand) }}" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#126BFF] bg-[#126BFF]/5 rounded-lg hover:bg-[#126BFF]/10 transition">View</a>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-5 py-12 text-center">
                            @include('superadmin.partials.empty-state', ['title' => 'Tidak ada brand', 'description' => 'Belum ada brand terdaftar.'])
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-5 py-4 border-t border-[#E2E8F0]">
        {{ $brands->withQueryString()->links() }}
    </div>
</div>
@endsection
