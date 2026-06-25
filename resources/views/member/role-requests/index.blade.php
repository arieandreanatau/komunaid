@extends('layouts.dashboard')

@section('content')
<div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-[#0F172A]">Role Request</h1>
            <p class="text-[#64748B] text-sm mt-1">Kelola pengajuan role kamu</p>
        </div>
        <a href="{{ route('member.role-requests.create') }}" class="bg-[#126BFF] text-white px-5 py-2 rounded-xl font-semibold hover:bg-[#0B2D89] transition text-sm">
            Ajukan Role Baru
        </a>
    </div>

    @if(session('success'))
        <div class="mb-4 bg-komuna-success-soft border border-green-400 text-komuna-success px-4 py-3 rounded-xl text-sm">
            {{ session('success') }}
        </div>
    @endif

    @if($roleRequests->isEmpty())
        <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
            <div class="w-16 h-16 bg-[#EEF7FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-[#126BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            </div>
            <h3 class="font-semibold text-[#0F172A] mb-1">Belum Ada Role Request</h3>
            <p class="text-[#64748B] text-sm mb-4">Ajukan role untuk mengakses fitur lebih lanjut.</p>
            <a href="{{ route('member.role-requests.create') }}" class="inline-block bg-[#126BFF] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#0B2D89] transition">
                Ajukan Role
            </a>
        </div>
    @else
        <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div class="divide-y divide-[#E2E8F0]">
                @foreach($roleRequests as $request)
                    <a href="{{ route('member.role-requests.show', $request) }}" class="block p-5 hover:bg-komuna-surface transition">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-[#EEF7FF] rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-[#126BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-[#0F172A] text-sm">{{ ucfirst(str_replace('_', ' ', $request->requested_role)) }}</h3>
                                    <p class="text-xs text-[#64748B]">{{ $request->created_at->format('d M Y H:i') }}</p>
                                </div>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-medium {{ $request->getStatusBadgeClass() }}">
                                {{ $request->status->label() }}
                            </span>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection
