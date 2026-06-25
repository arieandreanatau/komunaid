@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Proposal Kolaborasi</h1>
        <p class="text-komuna-muted">Kelola proposal kolaborasi brand Anda.</p>
    </div>
    <div class="flex items-center gap-2">
        <a href="{{ route('brand.proposals.export', request()->query()) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Export CSV</a>
        <a href="{{ route('brand.proposals.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">+ Ajukan Proposal</a>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 mb-6">
    <form method="GET" class="flex flex-wrap gap-3 items-center">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari proposal..." class="flex-1 min-w-[200px] border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
        <select name="status" class="border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">
            <option value="">Semua Status</option>
            <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
            <option value="sent" {{ request('status') === 'sent' ? 'selected' : '' }}>Terkirim</option>
            <option value="reviewed" {{ request('status') === 'reviewed' ? 'selected' : '' }}>Reviewed</option>
            <option value="accepted" {{ request('status') === 'accepted' ? 'selected' : '' }}>Diterima</option>
            <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Ditolak</option>
            <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Selesai</option>
            <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
        </select>
        <button type="submit" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Filter</button>
    </form>
</div>

@if($proposals->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Judul</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Target</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Budget</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Dikirim</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @forelse($proposals as $proposal)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <a href="{{ route('brand.proposals.show', $proposal) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-blue">{{ $proposal->title }}</a>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $proposal->target->name ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $proposal->collaborationType->name ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $proposal->estimated_budget ? 'Rp ' . number_format($proposal->estimated_budget, 0, ',', '.') : '-' }}</td>
                            <td class="px-6 py-4">
                                @php
                                    $statusColors = [
                                        'draft' => 'bg-komuna-border-soft text-komuna-text',
                                        'sent' => 'bg-komuna-light text-komuna-blue',
                                        'reviewed' => 'bg-komuna-info-soft text-komuna-info',
                                        'accepted' => 'bg-komuna-success-soft text-komuna-success',
                                        'rejected' => 'bg-komuna-danger-soft text-komuna-danger',
                                        'completed' => 'bg-komuna-success-soft text-komuna-success',
                                        'cancelled' => 'bg-komuna-warning-soft text-komuna-warning',
                                        'archived' => 'bg-komuna-border-soft text-komuna-muted',
                                    ];
                                @endphp
                                <span class="px-2 py-1 rounded-full text-xs font-medium {{ $statusColors[$proposal->status] ?? 'bg-komuna-border-soft text-komuna-text' }}">{{ ucfirst($proposal->status) }}</span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $proposal->sent_at?->format('d M Y') ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('brand.proposals.show', $proposal) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a>
                                    @if($proposal->status === 'draft')
                                        <a href="{{ route('brand.proposals.edit', $proposal) }}" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Edit</a>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="px-6 py-8 text-center text-komuna-muted text-sm">Tidak ada proposal ditemukan.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $proposals->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">📝</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Proposal</h3>
        <p class="text-komuna-muted text-sm mb-4">Ajukan proposal kolaborasi ke komunitas.</p>
        <a href="{{ route('brand.proposals.create') }}" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Ajukan Proposal</a>
    </div>
@endif
@endsection
