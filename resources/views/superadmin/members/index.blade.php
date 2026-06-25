@extends('layouts.admin')

@php $pageTitle = 'Members' @endphp

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-bold text-[#0B2D89]">Members</h1>
        <p class="text-[#64748B] text-sm mt-1">Kelola semua anggota platform</p>
    </div>
    <a href="{{ route("superadmin.members.export") }}" class="inline-flex items-center gap-2 px-4 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Export
    </a>
</div>

@include("superadmin.partials.search-filter", ["route" => route("superadmin.members.index"), "filters" => [["name" => "status", "label" => "Status", "options" => ["active" => "Active", "inactive" => "Inactive", "suspended" => "Suspended", "banned" => "Banned"]]]])

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">#</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Name</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Username</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Email</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Role</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Registered At</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
                @forelse($members as $member)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $member->id }}</td>
                        <td class="px-4 py-3 text-sm font-medium text-[#0F172A]">
                            <a href="{{ route("superadmin.members.show", $member) }}" class="hover:text-[#126BFF]">{{ $member->name }}</a>
                        </td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $member->username }}</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $member->email }}</td>
                        <td class="px-4 py-3">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#126BFF]/10 text-[#126BFF]">{{ $member->roles->pluck("name")->map(fn($r) => ucfirst(str_replace("_", " ", $r)))->implode(", ") ?: "Member" }}</span>
                        </td>
                        <td class="px-4 py-3">
                            @include("superadmin.partials.status-badge", ["status" => $member->banned_at ? "banned" : "active"])
                        </td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $member->created_at->format("d M Y") }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-1">
                                <a href="{{ route("superadmin.members.show", $member) }}" class="text-xs font-medium text-[#126BFF] hover:underline">View</a>
                                <a href="{{ route("superadmin.members.edit", $member) }}" class="text-xs font-medium text-[#64748B] hover:underline">Edit</a>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8">
                            @include("superadmin.partials.empty-state", ["title" => "Tidak ada member", "description" => "Belum ada member yang terdaftar."])
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t border-[#E2E8F0]">
        {{ $members->withQueryString()->links() }}
    </div>
</div>
@endsection
