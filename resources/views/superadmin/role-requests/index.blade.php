@extends('layouts.admin')

@php $pageTitle = 'Role Requests' @endphp

@section('content')
<div class="space-y-6">
    <div>
        <h1 class="text-2xl font-bold text-[#0B2D89]">Role Requests</h1>
        <p class="text-[#64748B] text-sm mt-1">Kelola permintaan role dari member</p>
    </div>

    <div class="flex flex-wrap gap-2">
        <a href="{{ route('superadmin.role-requests.index') }}" class="px-4 py-2 rounded-lg text-sm font-medium transition {{ !request('status') ? 'bg-[#126BFF] text-white shadow-sm' : 'bg-komuna-border-soft text-[#64748B] hover:bg-komuna-border' }}">Semua</a>
        <a href="{{ route('superadmin.role-requests.index', ['status' => 'pending']) }}" class="px-4 py-2 rounded-lg text-sm font-medium transition {{ request('status') === 'pending' ? 'bg-[#F59E0B] text-white shadow-sm' : 'bg-komuna-border-soft text-[#64748B] hover:bg-komuna-border' }}">Pending</a>
        <a href="{{ route('superadmin.role-requests.index', ['status' => 'approved']) }}" class="px-4 py-2 rounded-lg text-sm font-medium transition {{ request('status') === 'approved' ? 'bg-[#16A34A] text-white shadow-sm' : 'bg-komuna-border-soft text-[#64748B] hover:bg-komuna-border' }}">Approved</a>
        <a href="{{ route('superadmin.role-requests.index', ['status' => 'rejected']) }}" class="px-4 py-2 rounded-lg text-sm font-medium transition {{ request('status') === 'rejected' ? 'bg-[#DC2626] text-white shadow-sm' : 'bg-komuna-border-soft text-[#64748B] hover:bg-komuna-border' }}">Rejected</a>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-4">
        <form method="GET" action="{{ route('superadmin.role-requests.index') }}" class="flex flex-col sm:flex-row gap-3">
            <select name="requested_role" class="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF] outline-none bg-white">
                <option value="">Semua Role</option>
                <option value="member" {{ request('requested_role') === 'member' ? 'selected' : '' }}>Member</option>
                <option value="community_owner" {{ request('requested_role') === 'community_owner' ? 'selected' : '' }}>Community Owner</option>
                <option value="brand_owner" {{ request('requested_role') === 'brand_owner' ? 'selected' : '' }}>Brand Owner</option>
            </select>
            @if(request('status'))
                <input type="hidden" name="status" value="{{ request('status') }}">
            @endif
            <button type="submit" class="px-5 py-2.5 bg-[#0B2D89] text-white rounded-lg text-sm font-medium hover:bg-[#0B2D89]/90 transition shadow-sm">Filter</button>
        </form>
    </div>    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#E2E8F0]">
                <thead class="bg-[#0B2D89]/5">
                    <tr>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">User</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Username</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Requested Role</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Status</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Created At</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Reviewed By</th>
                        <th class="px-5 py-3.5 text-right text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                    @forelse($roleRequests as $req)
                        <tr class="hover:bg-[#126BFF]/[0.03] transition-colors">
                            <td class="px-5 py-3.5 text-sm font-medium text-[#0F172A]">{{ $req->user->name }}</td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $req->user->username ?? '-' }}</td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B] capitalize">{{ str_replace('_', ' ', $req->requested_role) }}</td>
                            <td class="px-5 py-3.5">
                                @php $sv = $req->status->value ?? $req->status; @endphp
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    {{ $sv === 'pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : ($sv === 'approved' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]') }}">
                                    {{ ucfirst($sv) }}
                                </span>
                            </td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $req->created_at->format('d M Y H:i') }}</td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $req->reviewer->name ?? '-' }}</td>
                            <td class="px-5 py-3.5 text-right">
                                <a href="{{ route('superadmin.role-requests.show', $req) }}" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#126BFF] hover:bg-[#126BFF]/10 rounded-lg transition">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                    Detail
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="px-5 py-16 text-center">
                            <div class="flex flex-col items-center gap-3">
                                <div class="w-16 h-16 bg-[#E2E8F0]/50 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-[#64748B]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg></div>
                                <p class="text-[#64748B] text-sm">Tidak ada role request ditemukan.</p>
                            </div>
                        </td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($roleRequests->hasPages())
    <div class="flex items-center justify-between">
        <p class="text-sm text-[#64748B]">Menampilkan {{ $roleRequests->firstItem() ?? 0 }} sampai {{ $roleRequests->lastItem() ?? 0 }} dari {{ $roleRequests->total() }} role request</p>
        <div>{{ $roleRequests->withQueryString()->links() }}</div>
    </div>
    @endif
</div>
@endsection