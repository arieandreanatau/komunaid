@extends('layouts.admin')

@php $pageTitle = 'Detail Member' @endphp

@section('content')
<div class="mb-6">
    <a href="{{ route("superadmin.members.index") }}" class="inline-flex items-center gap-1 text-sm text-[#126BFF] hover:underline mb-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali ke Members
    </a>
    <h1 class="text-2xl font-bold text-[#0B2D89]">Detail Member</h1>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h2 class="text-lg font-semibold text-[#0B2D89] mb-4">Profile</h2>
        <dl class="space-y-4">
            <div><dt class="text-xs font-medium text-[#64748B] uppercase">Name</dt><dd class="text-sm font-medium text-[#0F172A] mt-1">{{ $user->name }}</dd></div>
            <div><dt class="text-xs font-medium text-[#64748B] uppercase">Username</dt><dd class="text-sm text-[#0F172A] mt-1">{{ $user->username }}</dd></div>
            <div><dt class="text-xs font-medium text-[#64748B] uppercase">Email</dt><dd class="text-sm text-[#0F172A] mt-1">{{ $user->email }}</dd></div>
            <div><dt class="text-xs font-medium text-[#64748B] uppercase">Status</dt><dd class="mt-1">@include("superadmin.partials.status-badge", ["status" => $user->banned_at ? "banned" : "active"])</dd></div>
            <div><dt class="text-xs font-medium text-[#64748B] uppercase">Roles</dt><dd class="flex flex-wrap gap-1 mt-1">@forelse($user->roles as $role)<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#126BFF]/10 text-[#126BFF]">{{ ucfirst(str_replace("_", " ", $role->name)) }}</span>@empty<span class="text-xs text-[#64748B]">Member</span>@endforelse</dd></div>
            <div><dt class="text-xs font-medium text-[#64748B] uppercase">Created At</dt><dd class="text-sm text-[#0F172A] mt-1">{{ $user->created_at->format("d M Y H:i") }}</dd></div>
            <div><dt class="text-xs font-medium text-[#64748B] uppercase">Last Login</dt><dd class="text-sm text-[#0F172A] mt-1">{{ $user->last_login_at ? $user->last_login_at->format("d M Y H:i") : "-" }}</dd></div>
        </dl>
        <div class="mt-6 space-y-2">
            <a href="{{ route("superadmin.members.edit", $user) }}" class="block w-full text-center px-4 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">Edit</a>
            @if(!$user->banned_at)
                <button onclick="document.getElementById(&quot;suspend-modal&quot;).classList.remove(&quot;hidden&quot;)" class="block w-full text-center px-4 py-2 bg-[#F59E0B] text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition">Suspend</button>
                <button onclick="document.getElementById(&quot;ban-modal&quot;).classList.remove(&quot;hidden&quot;)" class="block w-full text-center px-4 py-2 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition">Ban</button>
            @else
                <form method="POST" action="{{ route("superadmin.members.activate", $user) }}">@csrf<button type="submit" class="block w-full text-center px-4 py-2 bg-[#16A34A] text-white text-sm font-medium rounded-lg hover:bg-green-700 transition" onclick="return confirm(&quot;Aktifkan user ini?&quot;)">Activate</button></form>
            @endif
        </div>
    </div>

    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] mb-6">
            <div class="flex border-b border-[#E2E8F0] overflow-x-auto">
                <button onclick="switchTab(event, &quot;tab-communities&quot;)" class="tab-btn px-5 py-3 text-sm font-medium text-[#126BFF] border-b-2 border-[#126BFF] whitespace-nowrap">Communities</button>
                <button onclick="switchTab(event, &quot;tab-events&quot;)" class="tab-btn px-5 py-3 text-sm font-medium text-[#64748B] border-b-2 border-transparent hover:text-[#0B2D89] whitespace-nowrap">Events</button>
                <button onclick="switchTab(event, &quot;tab-role-history&quot;)" class="tab-btn px-5 py-3 text-sm font-medium text-[#64748B] border-b-2 border-transparent hover:text-[#0B2D89] whitespace-nowrap">Role History</button>
                <button onclick="switchTab(event, &quot;tab-logs&quot;)" class="tab-btn px-5 py-3 text-sm font-medium text-[#64748B] border-b-2 border-transparent hover:text-[#0B2D89] whitespace-nowrap">Login Logs</button>
            </div>
            <div id="tab-communities" class="tab-content p-5">
                <h3 class="text-sm font-semibold text-[#0B2D89] mb-3">Communities Joined</h3>
                @if($user->communities && $user->communities->count() > 0)
                    <div class="space-y-2">@foreach($user->communities as $c)<div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg"><span class="text-sm font-medium text-[#0F172A]">{{ $c->name }}</span>@include("superadmin.partials.status-badge", ["status" => $c->pivot->status ?? "active"])</div>@endforeach</div>
                @else<p class="text-sm text-[#64748B] text-center py-4">Belum bergabung dengan komunitas</p>@endif
            </div>
            <div id="tab-events" class="tab-content p-5 hidden">
                <h3 class="text-sm font-semibold text-[#0B2D89] mb-3">Events Registered</h3>
                @if($user->events && $user->events->count() > 0)
                    <div class="space-y-2">@foreach($user->events as $ev)<div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg"><span class="text-sm font-medium text-[#0F172A]">{{ $ev->name }}</span><span class="text-xs text-[#64748B]">{{ $ev->pivot->created_at ? $ev->pivot->created_at->format("d M Y") : "-" }}</span></div>@endforeach</div>
                @else<p class="text-sm text-[#64748B] text-center py-4">Belum terdaftar di event</p>@endif
            </div>
            <div id="tab-role-history" class="tab-content p-5 hidden">
                <h3 class="text-sm font-semibold text-[#0B2D89] mb-3">Role Request History</h3>
                @if($roleRequestHistory->isEmpty())<p class="text-sm text-[#64748B] text-center py-4">Tidak ada role request</p>
                @else<div class="space-y-2">@foreach($roleRequestHistory as $req)<div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg"><div><p class="text-sm font-medium text-[#0F172A]">{{ ucfirst(str_replace("_", " ", $req->requested_role)) }}</p><p class="text-xs text-[#64748B]">{{ $req->created_at->format("d M Y H:i") }}</p></div>@include("superadmin.partials.status-badge", ["status" => $req->status])</div>@endforeach</div>
                @endif
            </div>
            <div id="tab-logs" class="tab-content p-5 hidden">
                <h3 class="text-sm font-semibold text-[#0B2D89] mb-3">Login Logs</h3>
                @if(isset($user->loginLogs) && $user->loginLogs->count() > 0)
                    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-[#E2E8F0]"><thead class="bg-[#EEF7FF]"><tr><th class="px-4 py-2 text-left text-xs font-semibold text-[#64748B] uppercase">Date</th><th class="px-4 py-2 text-left text-xs font-semibold text-[#64748B] uppercase">IP</th><th class="px-4 py-2 text-left text-xs font-semibold text-[#64748B] uppercase">Device</th></tr></thead><tbody class="divide-y divide-[#E2E8F0]">@foreach($user->loginLogs->take(10) as $log)<tr class="hover:bg-[#EEF7FF]/50 transition"><td class="px-4 py-2 text-sm text-[#0F172A]">{{ $log->created_at->format("d M Y H:i") }}</td><td class="px-4 py-2 text-sm text-[#64748B]">{{ $log->ip_address ?? "-" }}</td><td class="px-4 py-2 text-sm text-[#64748B] max-w-[200px] truncate">{{ $log->user_agent ?? "-" }}</td></tr>@endforeach</tbody></table></div>
                @else<p class="text-sm text-[#64748B] text-center py-4">Tidak ada log login</p>@endif
            </div>
        </div>
    </div>
</div>

<div id="suspend-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 text-center sm:p-0">
        <div class="fixed inset-0 bg-black/50" onclick="document.getElementById(&quot;suspend-modal&quot;).classList.add(&quot;hidden&quot;)"></div>
        <div class="inline-block overflow-hidden bg-white rounded-xl shadow-xl sm:my-8 sm:max-w-lg sm:w-full text-left align-bottom transform transition-all">
            <div class="px-6 pt-6 pb-4">
                <h3 class="text-lg font-semibold text-[#F59E0B] mb-3">Suspend User</h3>
                <form method="POST" action="{{ route("superadmin.members.suspend", $user) }}">
                    @csrf
                    <div class="mb-4"><label class="block text-sm font-medium text-[#64748B] mb-1">Reason</label><textarea name="reason" rows="3" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none" required></textarea></div>
                    <div class="flex justify-end gap-3">
                        <button type="button" onclick="document.getElementById(&quot;suspend-modal&quot;).classList.add(&quot;hidden&quot;)" class="px-4 py-2 text-sm font-medium text-[#64748B] bg-komuna-border-soft rounded-lg hover:bg-komuna-border">Batal</button>
                        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-[#F59E0B] rounded-lg hover:bg-yellow-600">Suspend</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<div id="ban-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 text-center sm:p-0">
        <div class="fixed inset-0 bg-black/50" onclick="document.getElementById(&quot;ban-modal&quot;).classList.add(&quot;hidden&quot;)"></div>
        <div class="inline-block overflow-hidden bg-white rounded-xl shadow-xl sm:my-8 sm:max-w-lg sm:w-full text-left align-bottom transform transition-all">
            <div class="px-6 pt-6 pb-4">
                <h3 class="text-lg font-semibold text-[#DC2626] mb-3">Ban User</h3>
                <form method="POST" action="{{ route("superadmin.members.ban", $user) }}">
                    @csrf
                    <div class="mb-4"><label class="block text-sm font-medium text-[#64748B] mb-1">Reason</label><textarea name="reason" rows="3" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none" required></textarea></div>
                    <div class="flex justify-end gap-3">
                        <button type="button" onclick="document.getElementById(&quot;ban-modal&quot;).classList.add(&quot;hidden&quot;)" class="px-4 py-2 text-sm font-medium text-[#64748B] bg-komuna-border-soft rounded-lg hover:bg-komuna-border">Batal</button>
                        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-lg hover:bg-red-700">Ban</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@push("scripts")
<script>function switchTab(e,tid){document.querySelectorAll(".tab-content").forEach(t=>t.classList.add("hidden"));document.querySelectorAll(".tab-btn").forEach(b=>{b.classList.remove("text-[#126BFF]","border-[#126BFF]");b.classList.add("text-[#64748B]","border-transparent")});document.getElementById(tid).classList.remove("hidden");e.target.classList.add("text-[#126BFF]","border-[#126BFF]");e.target.classList.remove("text-[#64748B]","border-transparent")}</script>
@endpush
@endsection
