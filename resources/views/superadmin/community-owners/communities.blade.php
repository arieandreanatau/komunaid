@extends('layouts.admin')

@php $pageTitle = 'Communities - ' . $user->name @endphp


@section('content')
<div class="mb-6">
    <a href="{{ route('superadmin.community-owners.show', $user) }}" class="inline-flex items-center gap-1.5 text-sm text-[#126BFF] hover:text-[#0B2D89] font-medium transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Detail
    </a>
</div>

<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">Communities - {{ $user->name }}</h1>
    <p class="text-[#64748B] mt-1">Semua komunitas yang dimiliki oleh {{ $user->name }}</p>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Name</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Category</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Members</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Status</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Created At</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
                @forelse($communities as $community)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-5 py-4">
                            <a href="{{ route('superadmin.communities.show', $community) }}" class="text-sm font-semibold text-[#0F172A] hover:text-[#126BFF] transition">{{ $community->name }}</a>
                        </td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $community->category->name ?? '-' }}</td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $community->activeMembers()->count() }}</td>
                        <td class="px-5 py-4">@include('superadmin.partials.status-badge', ['status' => $community->status])</td>
                        <td class="px-5 py-4 text-sm text-[#64748B]">{{ $community->created_at->format('d M Y') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-5 py-16 text-center">
                            <svg class="mx-auto h-12 w-12 text-[#64748B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/></svg>
                            <h3 class="mt-2 text-sm font-medium text-[#0F172A]">Tidak ada komunitas</h3>
                            <p class="mt-1 text-sm text-[#64748B]">User ini belum memiliki komunitas.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($communities->hasPages())
        <div class="px-5 py-4 border-t border-[#E2E8F0]">
            {{ $communities->withQueryString()->links() }}
        </div>
    @endif
</div>
@endsection
