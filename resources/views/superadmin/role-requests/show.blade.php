@extends('layouts.admin')

@php $pageTitle = 'Detail Role Request' @endphp

@section('content')
<div class="space-y-6">
    <div>
        <a href="{{ route('superadmin.role-requests.index') }}" class="text-sm text-[#126BFF] hover:text-[#0B2D89] transition inline-flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Role Requests
        </a>
        <h1 class="text-2xl font-bold text-[#0B2D89] mt-2">Detail Role Request</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-bold text-[#0B2D89] mb-6">Informasi Request</h2>
                <div class="space-y-4">
                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">User</span>
                        <span class="text-sm font-medium text-[#0F172A]">{{ $roleRequest->user->name }}</span>
                    </div>
                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">Email</span>
                        <span class="text-sm text-[#0F172A]">{{ $roleRequest->user->email ?? '-' }}</span>
                    </div>
                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">Username</span>
                        <span class="text-sm text-[#0F172A]">{{ $roleRequest->user->username ?? '-' }}</span>
                    </div>
                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">Requested Role</span>
                        <span class="text-sm font-bold text-[#0F172A] capitalize">{{ str_replace('_', ' ', $roleRequest->requested_role) }}</span>
                    </div>                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">Status</span>
                        @php $sv = $roleRequest->status->value ?? $roleRequest->status; @endphp
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            {{ $sv === 'pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : ($sv === 'approved' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]') }}">
                            {{ ucfirst($sv) }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">Tanggal Pengajuan</span>
                        <span class="text-sm text-[#0F172A]">{{ $roleRequest->created_at->format('d M Y H:i') }}</span>
                    </div>
                    @if($roleRequest->reviewed_at)
                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">Tanggal Review</span>
                        <span class="text-sm text-[#0F172A]">{{ $roleRequest->reviewed_at->format('d M Y H:i') }}</span>
                    </div>
                    @endif
                    @if($roleRequest->reviewer)
                    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                        <span class="text-sm text-[#64748B]">Direview Oleh</span>
                        <span class="text-sm text-[#0F172A]">{{ $roleRequest->reviewer->name }}</span>
                    </div>
                    @endif
                    @if($roleRequest->reason)
                    <div class="pb-4">
                        <span class="text-sm text-[#64748B] block mb-2">Alasan Penolakan</span>
                        <div class="bg-[#DC2626]/5 rounded-xl p-4 text-sm text-[#DC2626]">{{ $roleRequest->reason }}</div>
                    </div>
                    @endif
                    @if($roleRequest->payload)
                    <div class="pb-4">
                        <span class="text-sm text-[#64748B] block mb-2">Data Tambahan</span>
                        <div class="bg-[#EEF7FF] rounded-xl p-4">
                            @foreach($roleRequest->payload as $key => $value)
                                @if($value)
                                <div class="flex items-center justify-between py-1">
                                    <span class="text-xs text-[#64748B] capitalize">{{ str_replace('_', ' ', $key) }}</span>
                                    <span class="text-xs text-[#0F172A] font-medium">{{ $value }}</span>
                                </div>
                                @endif
                            @endforeach
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-bold text-[#0B2D89] mb-4">Aksi</h3>
                @if($sv === 'pending')
                    <div class="space-y-3">
                        <form method="POST" action="{{ route('superadmin.role-requests.approve', $roleRequest) }}">
                            @csrf
                            <button type="submit" class="w-full bg-[#16A34A] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#15803D] transition text-sm" onclick="return confirm('Approve request ini?')">Approve</button>
                        </form>
                        <form method="POST" action="{{ route('superadmin.role-requests.reject', $roleRequest) }}">
                            @csrf
                            <div class="space-y-2">
                                <label for="reason" class="block text-sm font-medium text-[#0F172A]">Alasan Penolakan</label>
                                <textarea name="reason" id="reason" rows="3" required class="block w-full rounded-xl border-[#E2E8F0] shadow-sm focus:ring-[#DC2626] focus:border-[#DC2626] border px-4 py-2.5 text-sm" placeholder="Alasan penolakan wajib diisi..."></textarea>
                                @error('reason')<p class="text-sm text-[#DC2626]">{{ $message }}</p>@enderror
                            </div>
                            <button type="submit" class="w-full mt-2 bg-[#DC2626] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm" onclick="return confirm('Reject request ini?')">Reject</button>
                        </form>
                    </div>
                @else
                    <div class="text-center py-4">
                        <p class="text-sm text-[#64748B]">Request ini sudah diproses.</p>
                        @if($roleRequest->reviewer)
                            <p class="text-xs text-[#64748B] mt-1">Oleh: {{ $roleRequest->reviewer->name }}</p>
                        @endif
                    </div>
                @endif
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-bold text-[#0B2D89] mb-3">Info User</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-[#64748B]">Status Akun</span>
                        <span class="font-medium {{ ($roleRequest->user->status ?? 'active') === 'active' ? 'text-[#16A34A]' : 'text-[#DC2626]' }}">{{ ucfirst($roleRequest->user->status ?? 'active') }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-[#64748B]">Role Saat Ini</span>
                        <span class="font-medium text-[#0F172A]">{{ $roleRequest->user->getRoleNames()->implode(', ') ?: 'Tidak ada role' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-[#64748B]">Bergabung</span>
                        <span class="text-[#0F172A]">{{ $roleRequest->user->created_at->format('d M Y') }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection