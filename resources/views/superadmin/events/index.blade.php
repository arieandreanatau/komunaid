@extends('layouts.admin')

@php $pageTitle = 'Events' @endphp

@section('content')
<div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-[#0B2D89]">Events</h1>
            <p class="text-[#64748B] text-sm mt-1">Kelola seluruh event lintas komunitas</p>
        </div>
        <a href="{{ route('superadmin.events.export', request()->query()) }}"
           class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#126BFF] text-white rounded-lg hover:bg-[#0B2D89] transition-colors text-sm font-medium shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export
        </a>
    </div>    <div class="bg-white rounded-xl shadow-sm p-4">
        <form method="GET" action="{{ route('superadmin.events.index') }}" class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari event..."
                       class="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF] outline-none transition">
            </div>
            <select name="status" class="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF] outline-none bg-white">
                <option value="">Semua Status</option>
                <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                <option value="published" {{ request('status') === 'published' ? 'selected' : '' }}>Published</option>
                <option value="ongoing" {{ request('status') === 'ongoing' ? 'selected' : '' }}>Ongoing</option>
                <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Archived</option>
            </select>
            <select name="location_type" class="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF] outline-none bg-white">
                <option value="">Semua Lokasi</option>
                <option value="online" {{ request('location_type') === 'online' ? 'selected' : '' }}>Online</option>
                <option value="offline" {{ request('location_type') === 'offline' ? 'selected' : '' }}>Offline</option>
                <option value="hybrid" {{ request('location_type') === 'hybrid' ? 'selected' : '' }}>Hybrid</option>
            </select>
            <button type="submit" class="px-5 py-2.5 bg-[#0B2D89] text-white rounded-lg text-sm font-medium hover:bg-[#0B2D89]/90 transition shadow-sm">Filter</button>
            <a href="{{ route('superadmin.events.index') }}" class="px-5 py-2.5 bg-komuna-border-soft text-[#64748B] rounded-lg text-sm font-medium hover:bg-komuna-border transition">Reset</a>
        </form>
    </div>    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#E2E8F0]">
                <thead class="bg-[#0B2D89]/5">
                    <tr>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Title</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Community</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Start</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">End</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Location</th>
                        <th class="px-5 py-3.5 text-left text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Status</th>
                        <th class="px-5 py-3.5 text-center text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Registrations</th>
                        <th class="px-5 py-3.5 text-right text-xs font-semibold text-[#0B2D89] uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                    @forelse($events as $event)
                        <tr class="hover:bg-[#126BFF]/[0.03] transition-colors">
                            <td class="px-5 py-3.5"><a href="{{ route('superadmin.events.show', $event) }}" class="text-sm font-medium text-[#0B2D89] hover:text-[#126BFF] transition">{{ $event->title }}</a></td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $event->community->name ?? '-' }}</td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $event->start_date ? $event->start_date->format('d M Y H:i') : '-' }}</td>
                            <td class="px-5 py-3.5 text-sm text-[#64748B]">{{ $event->end_date ? $event->end_date->format('d M Y H:i') : '-' }}</td>
                            <td class="px-5 py-3.5"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#25B9F2]/10 text-[#25B9F2] capitalize">{{ $event->location_type ?? '-' }}</span></td>
                            <td class="px-5 py-3.5">
                                @php
                                    $statusColors = [
                                        'draft' => 'bg-komuna-border-soft text-komuna-muted',
                                        'published' => 'bg-[#126BFF]/10 text-[#126BFF]',
                                        'ongoing' => 'bg-[#25B9F2]/10 text-[#25B9F2]',
                                        'completed' => 'bg-[#16A34A]/10 text-[#16A34A]',
                                        'cancelled' => 'bg-[#DC2626]/10 text-[#DC2626]',
                                        'archived' => 'bg-[#F59E0B]/10 text-[#F59E0B]',
                                    ];
                                @endphp
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$event->status] ?? 'bg-komuna-border-soft text-komuna-muted' }}">{{ ucfirst($event->status) }}</span>
                            </td>
                            <td class="px-5 py-3.5 text-center"><span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-[#0B2D89]/10 text-[#0B2D89] text-xs font-bold">{{ $event->registrations_count ?? $event->registrations->count() ?? 0 }}</span></td>
                            <td class="px-5 py-3.5 text-right">
                                <a href="{{ route('superadmin.events.show', $event) }}" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#126BFF] hover:bg-[#126BFF]/10 rounded-lg transition">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                    View
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="8" class="px-5 py-16 text-center">
                            <div class="flex flex-col items-center gap-3">
                                <div class="w-16 h-16 bg-[#E2E8F0]/50 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-[#64748B]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                                <p class="text-[#64748B] text-sm">Tidak ada event ditemukan.</p>
                            </div>
                        </td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($events->hasPages())
    <div class="flex items-center justify-between">
        <p class="text-sm text-[#64748B]">Menampilkan {{ $events->firstItem() ?? 0 }} sampai {{ $events->lastItem() ?? 0 }} dari {{ $events->total() }} event</p>
        <div>{{ $events->withQueryString()->links() }}</div>
    </div>
    @endif
</div>
@endsection