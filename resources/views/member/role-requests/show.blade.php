@extends('layouts.dashboard')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="mb-6">
        <a href="{{ route('member.role-requests.index') }}" class="text-sm text-[#126BFF] hover:text-[#0B2D89]">
            &larr; Kembali ke Role Request
        </a>
        <h1 class="text-2xl font-bold text-[#0F172A] mt-2">Detail Role Request</h1>
    </div>

    @if(session('success'))
        <div class="mb-4 bg-komuna-success-soft border border-green-400 text-komuna-success px-4 py-3 rounded-xl text-sm">
            {{ session('success') }}
        </div>
    @endif

    <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
        <div class="space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <span class="text-sm text-[#64748B]">Role Diajukan</span>
                <span class="font-bold text-[#0F172A]">{{ ucfirst(str_replace('_', ' ', $roleRequest->requested_role)) }}</span>
            </div>

            <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <span class="text-sm text-[#64748B]">Status</span>
                <span class="px-3 py-1 rounded-full text-xs font-medium {{ $roleRequest->getStatusBadgeClass() }}">
                    {{ $roleRequest->status->label() }}
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
                <div class="pb-4 border-b border-[#E2E8F0]">
                    <span class="text-sm text-[#64748B] block mb-2">Alasan Penolakan</span>
                    <div class="bg-komuna-danger-soft rounded-xl p-4 text-sm text-komuna-danger">
                        {{ $roleRequest->reason }}
                    </div>
                </div>
            @endif

            @if($roleRequest->payload)
                <div class="pb-4">
                    <span class="text-sm text-[#64748B] block mb-2">Data Tambahan</span>
                    <div class="bg-[#EEF7FF] rounded-xl p-4">
                        @foreach($roleRequest->payload as $key => $value)
                            @if($value)
                                <div class="flex items-center justify-between py-1">
                                    <span class="text-xs text-[#64748B]">{{ ucfirst(str_replace('_', ' ', $key)) }}</span>
                                    <span class="text-xs text-[#0F172A] font-medium">{{ $value }}</span>
                                </div>
                            @endif
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        @if($roleRequest->status->value === 'approved')
            <div class="mt-4 pt-4 border-t border-[#E2E8F0]">
                @if($roleRequest->requested_role === 'community_owner')
                    <a href="{{ route('community.dashboard') }}" class="block text-center bg-[#16A34A] text-white py-2.5 rounded-xl font-semibold hover:bg-[#15803D] transition">
                        Buka Community Dashboard
                    </a>
                @elseif($roleRequest->requested_role === 'brand_owner')
                    <a href="{{ route('brand.dashboard') }}" class="block text-center bg-[#F59E0B] text-white py-2.5 rounded-xl font-semibold hover:bg-[#D97706] transition">
                        Buka Brand Dashboard
                    </a>
                @elseif($roleRequest->requested_role === 'company_owner')
                    <a href="{{ route('company-owner.dashboard') }}" class="block text-center bg-[#8B5CF6] text-white py-2.5 rounded-xl font-semibold hover:bg-[#7C3AED] transition">
                        Buka Company Dashboard
                    </a>
                @endif
            </div>
        @endif

        @if(in_array($roleRequest->status->value, ['rejected', 'cancelled']))
            <div class="mt-4 pt-4 border-t border-[#E2E8F0]">
                <a href="{{ route('member.role-requests.create') }}" class="block text-center bg-[#126BFF] text-white py-2.5 rounded-xl font-semibold hover:bg-[#0B2D89] transition">
                    Ajukan Role Lain
                </a>
            </div>
        @endif
    </div>
</div>
@endsection
