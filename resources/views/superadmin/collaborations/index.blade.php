@extends('layouts.admin')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-komuna-text">Semua Proposal Kolaborasi</h1>
        <p class="text-komuna-muted">Moderasi semua proposal kolaborasi di platform.</p>
    </div>
    <a href="{{ route('superadmin.collaborations.export', request()->query()) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Export CSV</a>
</div>
<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 mb-6">
    <form method="GET" class="flex flex-wrap gap-3 items-center">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari proposal..." class="flex-1 min-w-[200px] border border-komuna-border rounded-lg px-4 py-2 text-sm">
        <select name="status" class="border border-komuna-border rounded-lg px-4 py-2 text-sm">
            <option value="">Semua Status</option>
            <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
            <option value="sent" {{ request('status') === 'sent' ? 'selected' : '' }}>Sent</option>
            <option value="accepted" {{ request('status') === 'accepted' ? 'selected' : '' }}>Accepted</option>
            <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Rejected</option>
            <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
            <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Archived</option>
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
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Judul</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Proposer</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Target</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @forelse($proposals as $proposal)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4 text-sm text-komuna-muted">#{{ $proposal->id }}</td>
                            <td class="px-6 py-4"><a href="{{ route('superadmin.collaborations.show', $proposal) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-blue">{{ $proposal->title }}</a></td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ ucfirst($proposal->proposer_type) }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ ucfirst($proposal->target_type) }}</td>
                            <td class="px-6 py-4">
                                @php $sc = ['draft'=>'bg-komuna-border-soft text-komuna-text','sent'=>'bg-blue-100 text-blue-800','reviewed'=>'bg-purple-100 text-purple-800','accepted'=>'bg-green-100 text-green-800','rejected'=>'bg-red-100 text-red-800','completed'=>'bg-emerald-100 text-emerald-800','cancelled'=>'bg-yellow-100 text-yellow-800','archived'=>'bg-komuna-border-soft text-komuna-muted']; @endphp
                                <span class="px-2 py-1 rounded-full text-xs font-medium {{ $sc[$proposal->status] ?? '' }}">{{ ucfirst($proposal->status) }}</span>
                            </td>
                            <td class="px-6 py-4"><a href="{{ route('superadmin.collaborations.show', $proposal) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a></td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="px-6 py-8 text-center text-komuna-muted text-sm">Tidak ada proposal.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $proposals->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center"><p class="text-komuna-muted">Tidak ada proposal ditemukan.</p></div>
@endif
@endsection
