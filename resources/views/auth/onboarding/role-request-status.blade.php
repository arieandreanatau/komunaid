@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-komuna-text">Status Pengajuan</h2>
        <p class="text-komuna-muted mt-1">Detail pengajuan role kamu</p>
    </div>

    @if(session('success'))
        <div class="mb-4">
            <x-alert type="success" :message="session('success')" />
        </div>
    @endif

    <div class="space-y-4">
        <div class="bg-komuna-light rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-komuna-muted">Role Diajukan</span>
                <span class="text-sm font-bold text-komuna-text">{{ ucfirst(str_replace('_', ' ', $roleRequest->requested_role)) }}</span>
            </div>
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-komuna-muted">Tanggal Pengajuan</span>
                <span class="text-sm text-komuna-text">{{ $roleRequest->created_at->format('d M Y H:i') }}</span>
            </div>
            @if($roleRequest->reviewed_at)
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-komuna-muted">Tanggal Review</span>
                    <span class="text-sm text-komuna-text">{{ $roleRequest->reviewed_at->format('d M Y H:i') }}</span>
                </div>
            @endif
        </div>

        <div class="text-center">
            @if($roleRequest->status->value === 'pending')
                <x-status-badge status="pending" />
                <p class="text-komuna-muted text-sm mt-3">Pengajuan kamu sedang ditinjau oleh Superadmin.</p>
            @elseif($roleRequest->status->value === 'approved')
                <x-status-badge status="approved" />
                <p class="text-komuna-muted text-sm mt-3">Pengajuan disetujui. Kamu sudah bisa mengakses dashboard terkait.</p>
                <div class="mt-4">
                    @if($roleRequest->requested_role === 'community_owner')
                        <a href="{{ route('community.dashboard') }}" class="inline-block bg-komuna-success text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition">
                            Buka Community Dashboard
                        </a>
                    @elseif($roleRequest->requested_role === 'brand_owner')
                        <a href="{{ route('brand.dashboard') }}" class="inline-block bg-komuna-warning text-white px-6 py-2 rounded-xl font-semibold hover:bg-amber-600 transition">
                            Buka Brand Dashboard
                        </a>
                    @elseif($roleRequest->requested_role === 'company_owner')
                        <a href="{{ route('company-owner.dashboard') }}" class="inline-block bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700 transition">
                            Buka Company Dashboard
                        </a>
                    @endif
                </div>
            @elseif($roleRequest->status->value === 'rejected')
                <x-status-badge status="rejected" />
                <p class="text-komuna-muted text-sm mt-3">Pengajuan ditolak.</p>
                @if($roleRequest->reason)
                    <div class="mt-3 bg-komuna-danger-soft rounded-xl p-4 text-sm text-komuna-danger">
                        <span class="font-medium">Alasan:</span> {{ $roleRequest->reason }}
                    </div>
                @endif
            @elseif($roleRequest->status->value === 'cancelled')
                <x-status-badge status="cancelled" />
                <p class="text-komuna-muted text-sm mt-3">Pengajuan dibatalkan.</p>
            @endif
        </div>

        @if(in_array($roleRequest->status->value, ['rejected', 'cancelled']))
            <div class="mt-4">
                <a href="{{ route('onboarding') }}" class="block text-center bg-komuna-blue text-white py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition text-sm">
                    Ajukan Role Lain
                </a>
            </div>
        @endif

        <div class="mt-4 text-center">
            <a href="{{ route('member.dashboard') }}" class="text-sm text-komuna-muted hover:text-komuna-text">
                &larr; Kembali ke Dashboard
            </a>
        </div>
    </div>
</div>
@endsection
