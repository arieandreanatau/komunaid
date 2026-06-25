@extends('layouts.admin')

@php $pageTitle = 'Login Hari Ini' @endphp

@section('content')
<div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-[#0B2D89]">Login Hari Ini</h1>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#16A34A]/10 text-[#16A34A]">Today</span>
            </div>
            <p class="text-[#64748B] text-sm mt-1">Riwayat login pengguna hari ini</p>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#126BFF]">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-[#64748B] uppercase font-medium">Total Login</p>
                    <p class="text-2xl font-bold text-[#0B2D89] mt-1">{{ $loginLogs->total() }}</p>
                </div>
                <div class="w-10 h-10 bg-[#126BFF]/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-[#126BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#16A34A]">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-[#64748B] uppercase font-medium">Berhasil</p>
                    <p class="text-2xl font-bold text-[#16A34A] mt-1">{{ $loginLogs->filter(fn($l) => $l->success ?? $l->is_success)->count() }}</p>
                </div>
                <div class="w-10 h-10 bg-[#16A34A]/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#DC2626]">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-[#64748B] uppercase font-medium">Gagal</p>
                    <p class="text-2xl font-bold text-[#DC2626] mt-1">{{ $loginLogs->filter(fn($l) => !($l->success ?? $l->is_success))->count() }}</p>
                </div>
                <div class="w-10 h-10 bg-[#DC2626]/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            </div>
        </div>
    </div>    <div class="bg-white rounded-xl shadow-sm p-4">
        <form method="GET" action="{{ route('superadmin.login-logs.today') }}" class="flex flex-col sm:flex-row gap-3">
            <select name="status" class="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF] outline-none bg-white">
                <option value="">Semua Status</option>
                <option value="1" {{ request('status') === '1' ? 'selected' : '' }}>Success</option>
                <option value="0" {{ request('status') === '0' ? 'selected' : '' }}>Failed</option>
            </select>
            <button type="submit" class="px-5 py-2.5 bg-[#0B2D89] text-white rounded-lg text-sm font-medium hover:bg-[#0B2D89]/90 transition shadow-sm">Filter</button>
            <a href="{{ route('superadmin.login-logs.today') }}" class="px-5 py-2.5 bg-komuna-border-soft text-[#64748B] rounded-lg text-sm font-medium hover:bg-komuna-border transition">Reset</a>
        </form>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#E2E8F0]">
                <thead class="bg-[#0B2D89]/5">
                    <tr>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">User</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Email</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">IP Address</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">User Agent</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Status</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Waktu</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                    @forelse($loginLogs as $log)
                        <tr class="hover:bg-[#126BFF]/[0.03] transition-colors">
                            <td class="px-5 py-3.5 text-sm font-medium text-[#0F172A]">{{ $log->user->name ?? '-' }}</td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $log->user->email ?? '-' }}</td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B] font-mono">{{ $log->ip_address ?? '-' }}</td>
                            <td class="px-5 py-3.5"><span class="block max-w-[200px] truncate text-xs text-[#64748B]" title="{{ $log->user_agent ?? '' }}">{{ $log->user_agent ?? '-' }}</span></td>
                            <td class="px-5 py-3.5">
                                @if($log->success ?? $log->is_success)
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A]">Success</span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DC2626]/10 text-[#DC2626]">Failed</span>
                                @endif
                            </td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $log->created_at->format('H:i:s') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="px-5 py-16 text-center">
                            <div class="flex flex-col items-center gap-3">
                                <div class="w-16 h-16 bg-[#E2E8F0]/50 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-[#64748B]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                                <p class="text-[#64748B] text-sm">Tidak ada login hari ini.</p>
                            </div>
                        </td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($loginLogs->hasPages())
    <div class="flex items-center justify-between">
        <p class="text-sm text-[#64748B]">Menampilkan {{ $loginLogs->firstItem() ?? 0 }} sampai {{ $loginLogs->lastItem() ?? 0 }} dari {{ $loginLogs->total() }} log</p>
        <div>{{ $loginLogs->withQueryString()->links() }}</div>
    </div>
    @endif
</div>
@endsection