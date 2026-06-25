@extends('layouts.admin')

@section('content')
<h2 class="text-xl font-bold text-komuna-text mb-6">Suggestions</h2>

<form action="{{ route('superadmin.cms.suggestions.index') }}" method="GET" class="flex gap-2 mb-6">
    <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari saran..." class="flex-1 rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
    <select name="status" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        <option value="">Semua Status</option>
        <option value="new" {{ request('status') === 'new' ? 'selected' : '' }}>New</option>
        <option value="reviewed" {{ request('status') === 'reviewed' ? 'selected' : '' }}>Reviewed</option>
        <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Archived</option>
    </select>
    <button type="submit" class="bg-komuna-blue text-white px-4 py-2 rounded-xl text-sm hover:bg-komuna-navy transition">Filter</button>
</form>

@if($suggestions->isNotEmpty())
    <div class="bg-white rounded-2xl border border-komuna-border-soft overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-komuna-surface border-b border-komuna-border-soft">
                <tr>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Subjek</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Nama</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Email</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Status</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Tanggal</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                @foreach($suggestions as $suggestion)
                    <tr class="hover:bg-komuna-surface">
                        <td class="px-4 py-3 text-komuna-text font-medium">{{ $suggestion->subject ?? '-' }}</td>
                        <td class="px-4 py-3 text-komuna-muted">{{ $suggestion->name ?? ($suggestion->user->name ?? '-') }}</td>
                        <td class="px-4 py-3 text-komuna-muted text-xs">{{ $suggestion->email ?? '-' }}</td>
                        <td class="px-4 py-3">
                            @php
                                $statusColors = ['new' => 'bg-blue-100 text-blue-700', 'reviewed' => 'bg-green-100 text-green-700', 'replied' => 'bg-purple-100 text-purple-700', 'archived' => 'bg-komuna-border-soft text-komuna-muted'];
                            @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full {{ $statusColors[$suggestion->status] ?? 'bg-komuna-border-soft' }}">{{ $suggestion->status }}</span>
                        </td>
                        <td class="px-4 py-3 text-komuna-light-text text-xs">{{ $suggestion->created_at->format('d M Y') }}</td>
                        <td class="px-4 py-3">
                            <a href="{{ route('superadmin.cms.suggestions.show', $suggestion) }}" class="text-komuna-blue hover:underline text-xs">Lihat</a>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $suggestions->links() }}</div>
@else
    <div class="bg-white rounded-2xl border border-komuna-border-soft p-8 text-center">
        <p class="text-komuna-muted">Belum ada saran.</p>
    </div>
@endif
@endsection
