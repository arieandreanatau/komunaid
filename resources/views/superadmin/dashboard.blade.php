@extends('layouts.admin')

@php $pageTitle = 'Dashboard Superadmin' @endphp

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-[#0B2D89]">Dashboard Superadmin</h1>
    <p class="text-[#64748B] text-sm mt-1">Overview platform KomunaID</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @php $metrics = [
        ['key' => 'total_members', 'label' => 'Total Members', 'color' => '#126BFF', 'bg' => '#EEF7FF'],
        ['key' => 'total_active_members', 'label' => 'Active Members', 'color' => '#16A34A', 'bg' => '#F0FDF4'],
        ['key' => 'total_banned_members', 'label' => 'Banned Members', 'color' => '#DC2626', 'bg' => '#FEF2F2'],
        ['key' => 'total_community_owners', 'label' => 'Community Owners', 'color' => '#0B2D89', 'bg' => '#EEF7FF'],
        ['key' => 'total_brand_owners', 'label' => 'Brand Owners', 'color' => '#F59E0B', 'bg' => '#FFFBEB'],
        ['key' => 'total_company_owners', 'label' => 'Company Owners', 'color' => '#64748B', 'bg' => '#F8FAFC'],
        ['key' => 'total_communities', 'label' => 'Total Communities', 'color' => '#126BFF', 'bg' => '#EEF7FF'],
        ['key' => 'total_active_communities', 'label' => 'Active Communities', 'color' => '#16A34A', 'bg' => '#F0FDF4'],
        ['key' => 'total_events', 'label' => 'Total Events', 'color' => '#25B9F2', 'bg' => '#ECFEFF'],
        ['key' => 'total_published_events', 'label' => 'Published Events', 'color' => '#16A34A', 'bg' => '#F0FDF4'],
        ['key' => 'total_upcoming_events', 'label' => 'Upcoming Events', 'color' => '#F59E0B', 'bg' => '#FFFBEB'],
        ['key' => 'total_brands', 'label' => 'Total Brands', 'color' => '#126BFF', 'bg' => '#EEF7FF'],
        ['key' => 'total_companies', 'label' => 'Total Companies', 'color' => '#64748B', 'bg' => '#F8FAFC'],
        ['key' => 'pending_role_requests', 'label' => 'Pending Role Requests', 'color' => '#F59E0B', 'bg' => '#FFFBEB'],
        ['key' => 'total_login_today', 'label' => 'Logins Today', 'color' => '#126BFF', 'bg' => '#EEF7FF'],
        ['key' => 'total_audit_today', 'label' => 'Audit Logs Today', 'color' => '#25B9F2', 'bg' => '#ECFEFF'],
    ]; @endphp
    @foreach($metrics as $metric)
        <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <div><p class="text-xs font-medium text-[#64748B]">{{ $metric["label"] }}</p>
                    <p class="text-2xl font-bold mt-1" style="color:{{ $metric["color"] }}">{{ $stats[$metric["key"]] ?? 0 }}</p></div>
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:{{ $metric["bg"] }}">
                    <span class="text-sm font-bold" style="color:{{ $metric["color"] }}">{{ strtoupper(substr($metric["label"],0,2)) }}</span>
                </div></div></div>
    @endforeach</div>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-gradient-to-br from-[#0B2D89] to-[#126BFF] rounded-xl shadow-sm p-5 text-white">
        <p class="text-xs font-medium text-blue-200">Platform Revenue</p>
        <p class="text-2xl font-bold mt-1">Rp {{ number_format($platformRevenue, 0, ",", ".") }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5"><div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-[#16A34A]/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg></div>
        <div><p class="text-xs text-[#64748B]">New Users / Month</p><p class="text-xl font-bold text-[#0B2D89]">{{ $newUsersThisMonth }}</p></div>
    </div></div>
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5"><div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-[#126BFF]/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-[#126BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
        <div><p class="text-xs text-[#64748B]">New Communities / Month</p><p class="text-xl font-bold text-[#0B2D89]">{{ $newCommunitiesThisMonth }}</p></div>
    </div></div>
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5"><div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-[#25B9F2]/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-[#25B9F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
        <div><p class="text-xs text-[#64748B]">New Events / Month</p><p class="text-xl font-bold text-[#0B2D89]">{{ $newEventsThisMonth }}</p></div>
    </div></div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <h2 class="text-sm font-semibold text-[#0B2D89]">Pending Role Requests</h2>
            <a href="{{ route("superadmin.role-requests.index") }}" class="text-xs text-[#126BFF] hover:underline">Lihat Semua</a>
        </div><div class="overflow-x-auto"><table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]"><tr>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">User</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Role</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Date</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Action</th>
            </tr></thead><tbody class="divide-y divide-[#E2E8F0]">
                @forelse($recentRoleRequests->take(5) as $req)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-4 py-3 text-sm font-medium text-[#0F172A]">{{ $req->user->name ?? "-" }}</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ ucfirst(str_replace("_", " ", $req->requested_role)) }}</td>
                        <td class="px-4 py-3">@include("superadmin.partials.status-badge", ["status" => $req->status])</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $req->created_at->format("d M Y") }}</td>
                        <td class="px-4 py-3"><a href="{{ route("superadmin.role-requests.show", $req) }}" class="text-xs font-medium text-[#126BFF] hover:underline">View</a></td>
                    </tr>
                @empty<tr><td colspan="5" class="px-4 py-8 text-center text-sm text-[#64748B]">Tidak ada role request pending</td></tr>
                @endforelse
            </tbody></table></div></div>
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <h2 class="text-sm font-semibold text-[#0B2D89]">Latest Users</h2>
            <a href="{{ route("superadmin.members.index") }}" class="text-xs text-[#126BFF] hover:underline">Lihat Semua</a>
        </div><div class="overflow-x-auto"><table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]"><tr>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Name</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Email</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Date</th>
            </tr></thead><tbody class="divide-y divide-[#E2E8F0]">
                @forelse($latestUsers->take(5) as $user)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-4 py-3 text-sm font-medium text-[#0F172A]">{{ $user->name }}</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $user->email }}</td>
                        <td class="px-4 py-3">@if($user->banned_at)@include("superadmin.partials.status-badge", ["status" => "banned"])@else@include("superadmin.partials.status-badge", ["status" => "active"])@endif</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $user->created_at->format("d M Y") }}</td>
                    </tr>
                @empty<tr><td colspan="4" class="px-4 py-8 text-center text-sm text-[#64748B]">Belum ada user</td></tr>
                @endforelse
            </tbody></table></div></div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <h2 class="text-sm font-semibold text-[#0B2D89]">Latest Communities</h2>
            <a href="{{ route("superadmin.communities.index") }}" class="text-xs text-[#126BFF] hover:underline">Lihat Semua</a>
        </div><div class="overflow-x-auto"><table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]"><tr>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Name</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Owner</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Date</th>
            </tr></thead><tbody class="divide-y divide-[#E2E8F0]">
                @forelse($latestCommunities->take(5) as $community)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-4 py-3 text-sm font-medium text-[#0F172A]">{{ $community->name }}</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $community->owner->name ?? "-" }}</td>
                        <td class="px-4 py-3">@include("superadmin.partials.status-badge", ["status" => $community->status])</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $community->created_at->format("d M Y") }}</td>
                    </tr>
                @empty<tr><td colspan="4" class="px-4 py-8 text-center text-sm text-[#64748B]">Belum ada komunitas</td></tr>
                @endforelse
            </tbody></table></div></div>
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <div class="px-5 py-4 border-b border-[#E2E8F0]">
            <h2 class="text-sm font-semibold text-[#0B2D89]">Latest Activities</h2>
        </div><div class="overflow-x-auto"><table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]"><tr>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">User</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Action</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Description</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase">Date</th>
            </tr></thead><tbody class="divide-y divide-[#E2E8F0]">
                @forelse($latestActivities->take(10) as $activity)
                    <tr class="hover:bg-[#EEF7FF]/50 transition">
                        <td class="px-4 py-3 text-sm font-medium text-[#0F172A]">{{ $activity->user->name ?? "-" }}</td>
                        <td class="px-4 py-3"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#126BFF]/10 text-[#126BFF]">{{ $activity->action }}</span></td>
                        <td class="px-4 py-3 text-sm text-[#64748B] max-w-[200px] truncate">{{ $activity->description ?? "-" }}</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $activity->created_at->format("d M Y H:i") }}</td>
                    </tr>
                @empty<tr><td colspan="4" class="px-4 py-8 text-center text-sm text-[#64748B]">Belum ada aktivitas</td></tr>
                @endforelse
            </tbody></table></div></div>
</div>
@endsection
