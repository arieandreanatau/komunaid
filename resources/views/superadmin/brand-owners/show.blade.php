@php $pageTitle = 'Detail Brand Owner' @endphp

@extends('layouts.admin')

@section('content')
<div class="mb-6">
    <a href="{{ route('superadmin.brand-owners.index') }}" class="inline-flex items-center gap-1.5 text-sm text-[#126BFF] hover:text-[#0B2D89] font-medium transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Brand Owners
    </a>
</div>

@if($user->banned_at)
    <div class="mb-6 bg-[#DC2626]/5 border border-[#DC2626]/20 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        <div>
            <h4 class="text-sm font-semibold text-[#DC2626]">Akun Ini Disuspend/Dibanned</h4>
            <p class="text-sm text-[#DC2626]/70 mt-0.5">User ini telah di suspend atau banned sejak {{ $user->banned_at ? \Carbon\Carbon::parse($user->banned_at)->format('d M Y H:i') : '-' }}.</p>
        </div>
    </div>
@endif

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div class="flex items-center gap-4 mb-6">
            <div class="w-14 h-14 rounded-full bg-[#126BFF] text-white flex items-center justify-center text-xl font-bold">{{ strtoupper(substr($user->name, 0, 1)) }}</div>
            <div>
                <h2 class="text-lg font-bold text-[#0F172A]">{{ $user->name }}</h2>
                <p class="text-sm text-[#64748B]">{{ '@' . ($user->username ?? '-') }}</p>
            </div>
        </div>
        <dl class="space-y-4 mb-6">
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Email</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $user->email }}</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Status</dt>
                <dd class="mt-0.5">@include('superadmin.partials.status-badge', ['status' => $user->banned_at ? 'banned' : 'active'])</dd>
            </div>
            <div>
                <dt class="text-xs font-medium text-[#64748B] uppercase tracking-wider">Joined</dt>
                <dd class="text-sm text-[#0F172A] mt-0.5">{{ $user->created_at->format('d M Y H:i') }}</dd>
            </div>
        </dl>
        <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-[#EEF7FF] rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-[#126BFF]">{{ $brandsCount }}</div>
                <div class="text-xs text-[#64748B] mt-1">Brands</div>
            </div>
        </div>
        <div class="space-y-2">
            @if($brandsCount > 0)
                <a href="{{ route('superadmin.brand-owners.brands', $user) }}" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">View Brands</a>
            @endif
            @if($user->banned_at)
                <form method="POST" action="{{ route('superadmin.brand-owners.activate', $user) }}">
                    @csrf
                    <button type="submit" class="w-full px-4 py-2.5 bg-[#16A34A] text-white text-sm font-medium rounded-lg hover:bg-[#15803D] transition" onclick="return confirm('Aktifkan user ini?')">Activate User</button>
                </form>
            @else
                <form method="POST" action="{{ route('superadmin.brand-owners.suspend', $user) }}">
                    @csrf
                    <button type="submit" class="w-full px-4 py-2.5 bg-[#F59E0B] text-white text-sm font-medium rounded-lg hover:bg-[#D97706] transition" onclick="return confirm('Suspend user ini?')">Suspend User</button>
                </form>
                <form method="POST" action="{{ route('superadmin.brand-owners.ban', $user) }}">
                    @csrf
                    <button type="submit" class="w-full px-4 py-2.5 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-[#B91C1C] transition" onclick="return confirm('Ban user ini?')">Ban User</button>
                </form>
            @endif
        </div>
    </div>
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 class="text-lg font-bold text-[#0F172A] mb-4">Brands</h3>
            @if($user->ownedBrands->isEmpty())
                <p class="text-sm text-[#64748B] text-center py-6">Belum ada brand.</p>
            @else
                <div class="space-y-2">
                    @foreach($user->ownedBrands as $brand)
                        <div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg border border-[#E2E8F0]">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-[#126BFF] text-white flex items-center justify-center text-xs font-bold">{{ strtoupper(substr($brand->name, 0, 1)) }}</div>
                                <div>
                                    <p class="text-sm font-medium text-[#0F172A]">{{ $brand->name }}</p>
                                    <p class="text-xs text-[#64748B]">{{ $brand->industry ?? '-' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                @include('superadmin.partials.status-badge', ['status' => $brand->status])
                                <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-xs text-[#126BFF] hover:text-[#0B2D89] font-medium">Detail</a>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 class="text-lg font-bold text-[#0F172A] mb-4">Role Request History</h3>
            @if($roleRequestHistory->isEmpty())
                <p class="text-sm text-[#64748B] text-center py-6">Tidak ada role request.</p>
            @else
                <div class="space-y-2">
                    @foreach($roleRequestHistory as $req)
                        <div class="flex items-center justify-between p-3 bg-[#EEF7FF]/50 rounded-lg border border-[#E2E8F0]">
                            <div>
                                <p class="text-sm font-medium text-[#0F172A]">{{ ucfirst(str_replace('_', ' ', $req->requested_role)) }}</p>
                                <p class="text-xs text-[#64748B]">{{ $req->created_at->format('d M Y H:i') }}</p>
                            </div>
                            @include('superadmin.partials.status-badge', ['status' => $req->status])
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
