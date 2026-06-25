@extends('layouts.admin')
@php $pageTitle = 'Community Owners' @endphp

@section('content')
<div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
        <h1 class="text-2xl font-bold text-[#0F172A]">Community Owners</h1>
        <p class="text-[#64748B] mt-1">Kelola semua pemilik komunitas di platform</p>
    </div>
    <a href="{{ route('superadmin.community-owners.export', request()->query()) }}"
       class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#0B2D89] text-sm font-medium rounded-xl hover:bg-[#EEF7FF] transition shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Export CSV
    </a>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-6">
    <form method="GET" action="{{ route('superadmin.community-owners.index') }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-medium text-[#64748B] mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nama, username, atau email..."
                   class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none transition">
        </div>
        <button type="submit" class="px-4 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Search
        </button>
        @if(request('search'))
            <a href="{{ route('superadmin.community-owners.index') }}" class="px-4 py-2 bg-komuna-border-soft text-[#64748B] text-sm font-medium rounded-lg hover:bg-komuna-border transition">Reset</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Name</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Username</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Email</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Status</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Communities</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
                @forelse($communityOwners as $owner)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-5 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-[#0B2D89] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {{ strtoupper(substr($owner->name, 0, 1)) }}
                                </div>
                                <a href="{{ route('superadmin.community-owners.show', $owner) }}" class="text-sm font-semibold text-[#0F172A] hover:text-[#126BFF] transition">{{ $owner->name }}</a>
                            </div>
                        </td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $owner->username ?? '-' }}</td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $owner->email }}</td>
                        <td class="px-5 py-4">
                            @if($owner->banned_at)
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20">Suspended</span>
                            @else
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">Active</span>
                            @endif
                        </td>
                        <td class="px-5 py-4">
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#126BFF]/10 text-[#126BFF] text-sm font-bold">{{ $owner->ownedCommunities->count() }}</span>
                        </td>
                        <td class="px-5 py-4">
                            <div class="flex items-center gap-1.5">
                                <a href="{{ route('superadmin.community-owners.show', $owner) }}" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#126BFF] bg-[#126BFF]/5 rounded-lg hover:bg-[#126BFF]/10 transition">View</a>
                                @if($owner->banned_at)
                                    <form method="POST" action="{{ route('superadmin.community-owners.activate', $owner) }}">
                                        @csrf
                                        <button type="submit" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#16A34A] bg-[#16A34A]/5 rounded-lg hover:bg-[#16A34A]/10 transition" onclick="return confirm('Aktifkan user ini?')">Activate</button>
                                    </form>
                                @else
                                    <form method="POST" action="{{ route('superadmin.community-owners.suspend', $owner) }}">
                                        @csrf
                                        <button type="submit" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/5 rounded-lg hover:bg-[#F59E0B]/10 transition" onclick="return confirm('Suspend user ini?')">Suspend</button>
                                    </form>
                                    <form method="POST" action="{{ route('superadmin.community-owners.ban', $owner) }}">
                                        @csrf
                                        <button type="submit" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#DC2626] bg-[#DC2626]/5 rounded-lg hover:bg-[#DC2626]/10 transition" onclick="return confirm('Ban user ini?')">Ban</button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-5 py-16 text-center">
                            <svg class="mx-auto h-12 w-12 text-[#64748B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            <h3 class="mt-2 text-sm font-medium text-[#0F172A]">Tidak ada community owner ditemukan</h3>
                            <p class="mt-1 text-sm text-[#64748B]">Tidak ada data yang cocok dengan filter pencarian Anda.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($communityOwners->hasPages())
        <div class="px-5 py-4 border-t border-[#E2E8F0]">{{ $communityOwners->withQueryString()->links() }}</div>
    @endif
</div>
@endsection
