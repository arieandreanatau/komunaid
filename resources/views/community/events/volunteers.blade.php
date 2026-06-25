@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Volunteers - {{ $event->title }}</h1>
        <p class="text-komuna-muted">Kelola volunteer event.</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
</div>

@if($volunteers->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Position</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Assigned At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($volunteers as $volunteer)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4 text-sm font-medium text-komuna-text">{{ $volunteer->user->name ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $volunteer->user->email ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $volunteer->position ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($volunteer->status === 'active') bg-komuna-success-soft text-komuna-success
                                    @elseif($volunteer->status === 'removed') bg-komuna-danger-soft text-komuna-danger
                                    @else bg-komuna-border-soft text-komuna-text
                                    @endif">
                                    {{ ucfirst($volunteer->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $volunteer->assigned_at ? $volunteer->assigned_at->format('d M Y H:i') : '-' }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    @if($volunteer->status !== 'active')
                                        <form action="{{ route('community.events.volunteers.activate', [$event, $volunteer]) }}" method="POST" class="inline">@csrf<button type="submit" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Activate</button></form>
                                    @endif
                                    @if($volunteer->status === 'active')
                                        <form action="{{ route('community.events.volunteers.deactivate', [$event, $volunteer]) }}" method="POST" class="inline">@csrf<button type="submit" class="text-komuna-warning hover:text-komuna-warning text-sm font-medium">Deactivate</button></form>
                                    @endif
                                    <form action="{{ route('community.events.volunteers.remove', [$event, $volunteer]) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin menghapus volunteer ini?')">@csrf<button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Remove</button></form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $volunteers->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">&#128101;</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Volunteer</h3>
        <p class="text-komuna-muted text-sm">Volunteer belum ditambahkan.</p>
    </div>
@endif
@endsection