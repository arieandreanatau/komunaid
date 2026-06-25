@extends('layouts.admin')
@php $pageTitle = 'Detail Brand' @endphp

@section('content')
<div class="mb-6">
    <a href="{{ route('superadmin.brands.index') }}" class="text-sm text-[#126BFF] hover:text-[#0B2D89] transition inline-flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
</div>

<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">{{ $brand->name }}</h1>
    <p class="text-[#64748B] mt-1">{{ $brand->description ?? 'Detail brand' }}</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h2 class="text-lg font-semibold text-[#0F172A] mb-4">Info Brand</h2>
        <dl class="space-y-3">
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase">Owner</dt>
                <dd class="text-sm font-medium text-[#0F172A]">{{ $brand->owner->name ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase">Industry</dt>
                <dd class="text-sm text-[#0F172A]">{{ $brand->industry ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase">Status</dt>
                <dd>@include('superadmin.partials.status-badge', ['status' => $brand->status])</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase">Active Members</dt>
                <dd class="text-sm text-[#0F172A]">{{ $membersCount }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase">Campaigns</dt>
                <dd class="text-sm text-[#0F172A]">{{ $brand->campaigns->count() }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase">Contact</dt>
                <dd class="text-sm text-[#0F172A]">{{ $brand->contact_email ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase">Website</dt>
                <dd class="text-sm text-[#0F172A]">{{ $brand->website ?? '-' }}</dd>
            </div>
        </dl>

        <div class="mt-6 space-y-2">
            <a href="{{ route('superadmin.brands.transfer-owner', $brand) }}" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25B9F2] text-white text-sm font-medium rounded-lg hover:bg-[#126BFF] transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                Transfer Ownership
            </a>
            @if($brand->status !== 'approved')
                <form method="POST" action="{{ route('superadmin.brands.approve', $brand) }}">
                    @csrf
                    <button type="submit" class="w-full px-4 py-2.5 bg-[#16A34A] text-white text-sm font-medium rounded-lg hover:bg-green-700 transition" onclick="return confirm('Approve brand ini?')">Approve</button>
                </form>
            @endif
            @if($brand->status === 'approved')
                <form method="POST" action="{{ route('superadmin.brands.ban', $brand) }}">
                    @csrf
                    <div class="mb-2">
                        <input type="text" name="reason" placeholder="Alasan ban..." class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#DC2626] outline-none" required>
                    </div>
                    <button type="submit" class="w-full px-4 py-2.5 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition" onclick="return confirm('Ban brand ini?')">Ban</button>
                </form>
            @endif
            @if($brand->status === 'banned' || $brand->status === 'suspended')
                <form method="POST" action="{{ route('superadmin.brands.activate', $brand) }}">
                    @csrf
                    <button type="submit" class="w-full px-4 py-2.5 bg-[#16A34A] text-white text-sm font-medium rounded-lg hover:bg-green-700 transition" onclick="return confirm('Aktifkan kembali brand ini?')">Activate</button>
                </form>
            @endif
            <form method="POST" action="{{ route('superadmin.brands.destroy', $brand) }}">
                @csrf
                @method('DELETE')
                <button type="submit" class="w-full px-4 py-2.5 bg-komuna-muted text-white text-sm font-medium rounded-lg hover:bg-komuna-navy-dark transition" onclick="return confirm('Arsipkan brand ini?')">Archive</button>
            </form>
        </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
        @if($brand->description)
            <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
                <h2 class="text-lg font-semibold text-[#0F172A] mb-2">Deskripsi</h2>
                <p class="text-sm text-[#64748B]">{{ $brand->description }}</p>
            </div>
        @endif

        @if($brand->campaigns->count() > 0)
            <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
                <h2 class="text-lg font-semibold text-[#0F172A] mb-4">Campaigns ({{ $brand->campaigns->count() }})</h2>
                <div class="space-y-2">
                    @foreach($brand->campaigns->take(5) as $campaign)
                        <div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-[#0F172A]">{{ $campaign->title }}</p>
                                <p class="text-xs text-[#64748B]">{{ ucfirst($campaign->campaign_type ?? '-') }} - {{ ucfirst($campaign->status ?? '-') }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        @if($brand->collaborationRequests->count() > 0)
            <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
                <h2 class="text-lg font-semibold text-[#0F172A] mb-4">Collaborations ({{ $brand->collaborationRequests->count() }})</h2>
                <div class="space-y-2">
                    @foreach($brand->collaborationRequests->take(5) as $collab)
                        <div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-[#0F172A]">{{ $collab->title }}</p>
                                <p class="text-xs text-[#64748B]">To: {{ $collab->community->name ?? '-' }} - {{ ucfirst($collab->status) }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</div>
@endsection
