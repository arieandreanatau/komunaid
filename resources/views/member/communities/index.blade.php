@extends('layouts.dashboard')

@section('content')
<div class="space-y-6">

    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-komuna-text">Komunitas Saya</h1>
            <p class="text-komuna-muted mt-1"><span class="font-semibold text-komuna-text">{{ $communities->total() }}</span> komunitas diikuti</p>
        </div>
        <a href="{{ route('member.communities.export') }}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-green text-white rounded-xl font-medium hover:bg-komuna-green/90 transition text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export CSV
        </a>
    </div>

    <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-komuna-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" id="searchInput" placeholder="Cari komunitas..." class="w-full pl-12 pr-4 py-3 rounded-xl border border-komuna-border bg-komuna-surface text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
        </div>
        <select id="statusFilter" onchange="filterByStatus(this.value)" class="px-4 py-3 rounded-xl border border-komuna-border bg-komuna-surface text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="pending">Pending</option>
            <option value="left">Keluar</option>
        </select>
    </div>

    @if($communities && $communities->count() > 0)
        <div class="bg-komuna-surface border border-komuna-border rounded-2xl overflow-hidden">
            <div class="hidden md:block overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-komuna-border">
                            <th class="text-left px-6 py-4 text-xs font-semibold text-komuna-muted uppercase tracking-wider">Komunitas</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-komuna-muted uppercase tracking-wider">Kategori</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-komuna-muted uppercase tracking-wider">Lokasi</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-komuna-muted uppercase tracking-wider">Role</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-komuna-muted uppercase tracking-wider">Status</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-komuna-muted uppercase tracking-wider">Bergabung</th>
                            <th class="text-right px-6 py-4 text-xs font-semibold text-komuna-muted uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-komuna-border">
                        @foreach($communities as $membership)
                            <tr class="community-row hover:bg-komuna-light/50 transition" data-status="{{ $membership->status }}" data-name="{{ strtolower($membership->community->name) }}">
                                <td class="px-6 py-4">
                                    <a href="{{ route('member.communities.show', $membership->community->slug) }}" class="flex items-center gap-3">
                                        <div class="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-komuna-light">
                                            @if($membership->community->logo)
                                                <img src="{{ asset('storage/' . $membership->community->logo) }}" alt="{{ $membership->community->name }}" class="w-full h-full object-cover">
                                            @else
                                                <div class="w-full h-full bg-komuna-blue/10 flex items-center justify-center text-komuna-blue font-bold text-sm">{{ strtoupper(substr($membership->community->name, 0, 1)) }}</div>
                                            @endif
                                        </div>
                                        <span class="font-semibold text-komuna-text hover:text-komuna-blue transition">{{ $membership->community->name }}</span>
                                    </a>
                                </td>
                                <td class="px-6 py-4 text-sm text-komuna-muted">{{ $membership->community->category->name ?? '-' }}</td>
                                <td class="px-6 py-4 text-sm text-komuna-muted">{{ trim(($membership->community->city ?? '') . ', ' . ($membership->community->province ?? ''), ', ') ?: '-' }}</td>
                                <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-komuna-blue/10 text-komuna-blue">{{ ucfirst($membership->role ?? 'Member') }}</span></td>
                                <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold {{ $membership->status === 'active' ? 'bg-komuna-green/10 text-komuna-green' : ($membership->status === 'pending' ? 'bg-komuna-orange/10 text-komuna-orange' : 'bg-komuna-muted/10 text-komuna-muted') }}">{{ ucfirst($membership->status) }}</span></td>
                                <td class="px-6 py-4 text-sm text-komuna-muted">{{ $membership->created_at ? $membership->created_at->translatedFormat('d M Y') : '-' }}</td>
                                <td class="px-6 py-4 text-right"><a href="{{ route('member.communities.show', $membership->community->slug) }}" class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition">Lihat</a></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="md:hidden divide-y divide-komuna-border">
                @foreach($communities as $membership)
                    <div class="community-card p-4 hover:bg-komuna-light/50 transition" data-status="{{ $membership->status }}" data-name="{{ strtolower($membership->community->name) }}">
                        <a href="{{ route('member.communities.show', $membership->community->slug) }}" class="flex items-center gap-3 mb-3">
                            <div class="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-komuna-light">
                                @if($membership->community->logo)
                                    <img src="{{ asset('storage/' . $membership->community->logo) }}" alt="{{ $membership->community->name }}" class="w-full h-full object-cover">
                                @else
                                    <div class="w-full h-full bg-komuna-blue/10 flex items-center justify-center text-komuna-blue font-bold">{{ strtoupper(substr($membership->community->name, 0, 1)) }}</div>
                                @endif
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-komuna-text truncate">{{ $membership->community->name }}</p>
                                <p class="text-xs text-komuna-muted">{{ $membership->community->category->name ?? '' }}</p>
                            </div>
                        </a>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-komuna-blue/10 text-komuna-blue">{{ ucfirst($membership->role ?? 'Member') }}</span>
                            <span class="px-2.5 py-1 rounded-full text-xs font-semibold {{ $membership->status === 'active' ? 'bg-komuna-green/10 text-komuna-green' : ($membership->status === 'pending' ? 'bg-komuna-orange/10 text-komuna-orange' : 'bg-komuna-muted/10 text-komuna-muted') }}">{{ ucfirst($membership->status) }}</span>
                            <span class="text-xs text-komuna-muted ml-auto">{{ $membership->created_at ? $membership->created_at->translatedFormat('d M Y') : '' }}</span>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <div class="mt-4">{{ $communities->withQueryString()->links() }}</div>
    @else
        <div class="text-center py-16 bg-komuna-surface border border-komuna-border rounded-2xl">
            <svg class="w-16 h-16 text-komuna-muted/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <p class="text-lg font-semibold text-komuna-text">Belum ada komunitas yang diikuti.</p>
            <p class="text-sm text-komuna-muted mt-1">Mulai jelajahi dan bergabung dengan komunitas yang menarik.</p>
            <a href="{{ route('communities.directory') }}" class="inline-flex items-center mt-4 px-6 py-3 bg-komuna-blue text-white rounded-xl font-medium hover:bg-komuna-blue/90 transition">Jelajahi Komunitas</a>
        </div>
    @endif
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('searchInput').addEventListener('input', function() {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.community-row, .community-card').forEach(el => {
                el.style.display = (el.dataset.name || '').includes(q) ? '' : 'none';
            });
        });
    });
    function filterByStatus(s) {
        document.querySelectorAll('.community-row, .community-card').forEach(el => {
            el.style.display = (s === 'all' || el.dataset.status === s) ? '' : 'none';
        });
    }
</script>
@endsection
