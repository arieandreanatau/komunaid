@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">Audit Logs</h1>
    <p class="text-[#64748B]">Riwayat semua aktivitas penting di platform</p>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
    <form method="GET" action="{{ route('superadmin.audit-logs.index') }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-[#64748B] mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Deskripsi atau aksi..."
                   class="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-[#126BFF] focus:border-[#126BFF]">
        </div>
        <div class="min-w-[150px]">
            <label class="block text-sm font-medium text-[#64748B] mb-1">Action</label>
            <select name="action" class="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-[#126BFF] focus:border-[#126BFF]">
                <option value="">Semua Action</option>
                @foreach($actions as $action)
                    <option value="{{ $action }}" {{ request('action') === $action ? 'selected' : '' }}>{{ $action }}</option>
                @endforeach
            </select>
        </div>
        <div class="min-w-[130px]">
            <label class="block text-sm font-medium text-[#64748B] mb-1">Date From</label>
            <input type="date" name="date_from" value="{{ request('date_from') }}"
                   class="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-[#126BFF] focus:border-[#126BFF]">
        </div>
        <div class="min-w-[130px]">
            <label class="block text-sm font-medium text-[#64748B] mb-1">Date To</label>
            <input type="date" name="date_to" value="{{ request('date_to') }}"
                   class="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-[#126BFF] focus:border-[#126BFF]">
        </div>
        <button type="submit" class="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Filter</button>
        <a href="{{ route('superadmin.audit-logs.index') }}" class="bg-komuna-border-soft text-[#64748B] px-4 py-2 rounded-lg text-sm hover:bg-[#EEF7FF]/50">Reset</a>
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E2E8F0]">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Time</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">User</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Action</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Description</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">IP</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
                @forelse($auditLogs as $log)
                    <tr class="hover:bg-[#EEF7FF]/50 cursor-pointer" onclick="window.location='{{ route('superadmin.audit-logs.show', $log) }}'">
                        <td class="px-4 py-3 text-sm text-[#64748B] whitespace-nowrap">{{ $log->created_at->format('d M Y H:i:s') }}</td>
                        <td class="px-4 py-3 text-sm text-[#0F172A]">{{ $log->user->name ?? 'System' }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded-full text-xs font-medium
                                @if(str_contains($log->action, 'approved') || str_contains($log->action, 'confirmed') || str_contains($log->action, 'activated')) bg-[#16A34A]/10 text-[#16A34A]
                                @elseif(str_contains($log->action, 'rejected') || str_contains($log->action, 'deleted') || str_contains($log->action, 'banned')) bg-[#DC2626]/10 text-[#DC2626]
                                @elseif(str_contains($log->action, 'suspended')) bg-[#F59E0B]/10 text-[#F59E0B]
                                @else bg-blue-100 text-blue-800
                                @endif">
                                {{ $log->action }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ Str::limit($log->description, 60) ?? '-' }}</td>
                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $log->ip_address ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-4 py-8 text-center text-[#64748B]">Tidak ada audit log.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="p-4">
        {{ $auditLogs->withQueryString()->links() }}
    </div>
</div>
@endsection
