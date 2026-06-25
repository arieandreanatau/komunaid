@extends('layouts.admin')

@php $pageTitle = 'Login Logs' @endphp

@section('content')
<div class="space-y-6">
    <div>
        <h1 class="text-2xl font-bold text-[#0B2D89]">Login Logs</h1>
        <p class="text-[#64748B] text-sm mt-1">Riwayat login seluruh pengguna</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-4">
        <form method="GET" action="{{ route('superadmin.login-logs.index') }}" class="flex flex-col sm:flex-row gap-3">
            <div class="min-w-[180px]">
                <input type="date" name="date" value="{{ request('date') }}" class="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF] outline-none transition">
            </div>
            <select name="status" class="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF] outline-none bg-white">
                <option value="">Semua Status</option>
                <option value="1" {{ request('status') === '1' ? 'selected' : '' }}>Success</option>
                <option value="0" {{ request('status') === '0' ? 'selected' : '' }}>Failed</option>
            </select>
            <button type="submit" class="px-5 py-2.5 bg-[#0B2D89] text-white rounded-lg text-sm font-medium hover:bg-[#0B2D89]/90 transition shadow-sm">Filter</button>
            <a href="{{ route('superadmin.login-logs.index') }}" class="px-5 py-2.5 bg-komuna-border-soft text-[#64748B] rounded-lg text-sm font-medium hover:bg-komuna-border transition">Reset</a>
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
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Logged At</th>
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
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $log->created_at->format('d M Y H:i:s') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="px-5 py-16 text-center">
                            <div class="flex flex-col items-center gap-3">
                                <div class="w-16 h-16 bg-[#E2E8F0]/50 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-[#64748B]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                                <p class="text-[#64748B] text-sm">Tidak ada log login ditemukan.</p>
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