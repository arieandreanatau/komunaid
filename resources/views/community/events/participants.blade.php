@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Peserta Event</h1>
        <p class="text-komuna-muted">{{ $event->title }} &mdash; {{ $participants->total() }} peserta</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
        <a href="{{ route('community.events.participants.export', $event) }}" class="bg-white border border-komuna-border text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-surface transition">Export CSV</a>
    </div>
</div>
<div class="flex flex-wrap gap-2 mb-6">
    <a href="{{ route('community.events.participants.index', $event) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('status') ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">All</a>
    <a href="{{ route('community.events.participants.index', array_merge(request()->all(), ['status' => 'registered'])) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'registered' ? 'bg-komuna-border text-komuna-text' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Registered</a>
    <a href="{{ route('community.events.participants.index', array_merge(request()->all(), ['status' => 'approved'])) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'approved' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Approved</a>
    <a href="{{ route('community.events.participants.index', array_merge(request()->all(), ['status' => 'rejected'])) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'rejected' ? 'bg-komuna-danger-soft text-komuna-danger' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Rejected</a>
    <a href="{{ route('community.events.participants.index', array_merge(request()->all(), ['status' => 'attended'])) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'attended' ? 'bg-komuna-light text-komuna-blue' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Attended</a>
    <a href="{{ route('community.events.participants.index', array_merge(request()->all(), ['status' => 'cancelled'])) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'cancelled' ? 'bg-komuna-warning-soft text-komuna-warning' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Cancelled</a>
</div>
@if($participants->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Registered At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Approved At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Attendance</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($participants as $p)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4 text-sm font-medium text-komuna-text">{{ $p->user->name ?? $p->name ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $p->user->email ?? $p->email ?? '-' }}</td>
                            <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium
                                @if($p->status === 'approved') bg-komuna-success-soft text-komuna-success
                                @elseif($p->status === 'registered' || $p->status === 'pending') bg-komuna-border-soft text-komuna-text
                                @elseif($p->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                @elseif($p->status === 'attended') bg-komuna-light text-komuna-blue
                                @elseif($p->status === 'cancelled') bg-komuna-warning-soft text-komuna-warning
                                @else bg-komuna-border-soft text-komuna-muted @endif">{{ ucfirst($p->status) }}</span></td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $p->created_at->format('d M Y H:i') }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $p->approved_at ? $p->approved_at->format('d M Y H:i') : '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $p->attendance_at ? $p->attendance_at->format('d M Y H:i') : '-' }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    @if(in_array($p->status, ['registered', 'pending']))
                                        <form action="{{ route('community.events.participants.approve', [$event, $p]) }}" method="POST" class="inline">@csrf<button type="submit" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Approve</button></form>
                                        <form action="{{ route('community.events.participants.reject', [$event, $p]) }}" method="POST" class="inline" onsubmit="return confirm('Reject?')">@csrf<button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Reject</button></form>
                                    @endif
                                    @if(in_array($p->status, ['approved', 'registered']))
                                        <form action="{{ route('community.events.participants.attend', [$event, $p]) }}" method="POST" class="inline">@csrf<button type="submit" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Hadir</button></form>
                                    @endif
                                    <form action="{{ route('community.events.participants.cancel', [$event, $p]) }}" method="POST" class="inline" onsubmit="return confirm('Batalkan?')">@csrf<button type="submit" class="text-komuna-warning hover:text-komuna-warning text-sm font-medium">Cancel</button></form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $participants->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Peserta</h3>
        <p class="text-komuna-muted text-sm">Peserta belum mendaftar.</p>
    </div>
@endif
@endsection