@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Proposal Kolaborasi Masuk</h1>
        <p class="text-komuna-muted">Proposal dari brand dan perusahaan ke komunitas Anda.</p>
    </div>
    <a href="{{ route('community.proposals.export', request()->query()) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Export CSV</a>
</div>
<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-4 mb-6">
    <form method="GET" class="flex flex-wrap gap-3 items-center">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari judul/proposer..." class="flex-1 min-w-[200px] border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">
        <select name="community_id" class="border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">
            <option value="">Semua Komunitas</option>
            @foreach($communities as $c)
                <option value="{{ $c->id }}" {{ request('community_id') == $c->id ? 'selected' : '' }}>{{ $c->name }}</option>
            @endforeach
        </select>
        <select name="status" class="border border-komuna-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-komuna-blue">
            <option value="">Semua Status</option>
            <option value="sent" {{ request('status') === 'sent' ? 'selected' : '' }}>Terkirim</option>
            <option value="reviewed" {{ request('status') === 'reviewed' ? 'selected' : '' }}>Reviewed</option>
            <option value="accepted" {{ request('status') === 'accepted' ? 'selected' : '' }}>Diterima</option>
            <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Ditolak</option>
            <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Selesai</option>
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
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Proposer</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @forelse($proposals as $proposal)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4"><a href="{{ route('community.proposals.show', $proposal) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-blue">{{ $proposal->title }}</a></td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ ucfirst($proposal->proposer_type) }} #{{ $proposal->proposer_id }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $proposal->collaborationType->name ?? '-' }}</td>
                            <td class="px-6 py-4">
                                @php $sc = ['sent'=>'bg-blue-100 text-blue-800','reviewed'=>'bg-purple-100 text-purple-800','accepted'=>'bg-green-100 text-green-800','rejected'=>'bg-red-100 text-red-800','completed'=>'bg-emerald-100 text-emerald-800','cancelled'=>'bg-yellow-100 text-yellow-800']; @endphp
                                <span class="px-2 py-1 rounded-full text-xs font-medium {{ $sc[$proposal->status] ?? 'bg-komuna-border-soft text-komuna-text' }}">{{ ucfirst($proposal->status) }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <a href="{{ route('community.proposals.show', $proposal) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="px-6 py-8 text-center text-komuna-muted text-sm">Belum ada proposal masuk.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $proposals->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">📥</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Proposal Masuk</h3>
        <p class="text-komuna-muted text-sm">Proposal dari brand dan perusahaan akan muncul di sini.</p>
    </div>
@endif
@endsection
