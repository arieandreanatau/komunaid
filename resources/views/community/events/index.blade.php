@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Event Management</h1>
        <p class="text-komuna-muted">Kelola semua event dari komunitas Anda.</p>
    </div>
    <a href="{{ route('community.events.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Buat Event
    </a>
</div>

<div class="flex flex-wrap gap-2 mb-6">
    <a href="{{ route('community.events.index') }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('status') ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Semua</a>
    <a href="{{ route('community.events.index', ['status' => 'draft']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'draft' ? 'bg-komuna-border text-komuna-text' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Draft</a>
    <a href="{{ route('community.events.index', ['status' => 'published']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'published' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Published</a>
    <a href="{{ route('community.events.index', ['status' => 'cancelled']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'cancelled' ? 'bg-komuna-danger-soft text-komuna-danger' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Cancelled</a>
    <a href="{{ route('community.events.index', ['status' => 'archived']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'archived' ? 'bg-komuna-info-soft text-komuna-info' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Archived</a>
</div>

@if($events->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Event</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Komunitas</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Lokasi</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tanggal</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($events as $event)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <a href="{{ route('community.events.show', $event) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-success">{{ $event->title }}</a>
                                <p class="text-xs text-komuna-muted">{{ Str::limit($event->description, 50) }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $event->community->name ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($event->event_type === 'paid') bg-komuna-info-soft text-komuna-info
                                    @elseif($event->event_type === 'free') bg-komuna-success-soft text-komuna-success
                                    @elseif($event->event_type === 'volunteer') bg-teal-100 text-teal-800
                                    @elseif($event->event_type === 'charity') bg-komuna-warning-soft text-orange-800
                                    @else bg-komuna-light text-komuna-blue
                                    @endif">
                                    {{ ucfirst($event->event_type) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $event->location_name ?? ucfirst($event->location_type) }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $event->start_datetime->format('d M Y H:i') }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if(($event->status ?? 'draft') === 'published') bg-komuna-success-soft text-komuna-success
                                    @elseif(($event->status ?? 'draft') === 'cancelled') bg-komuna-danger-soft text-komuna-danger
                                    @elseif(($event->status ?? 'draft') === 'archived') bg-komuna-info-soft text-komuna-info
                                    @else bg-komuna-border-soft text-komuna-muted
                                    @endif">
                                    {{ ucfirst($event->status ?? 'draft') }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <a href="{{ route('community.events.show', $event) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Detail</a>
                                    <a href="{{ route('community.events.edit', $event) }}" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Edit</a>
                                    @if(($event->status ?? 'draft') === 'draft')
                                        <form action="{{ route('community.events.publish', $event) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Publish</button>
                                        </form>
                                    @endif
                                    @if(($event->status ?? 'draft') === 'published')
                                        <form action="{{ route('community.events.cancel', $event) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin membatalkan event ini?')">
                                            @csrf
                                            <button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Cancel</button>
                                        </form>
                                    @endif
                                    @if(in_array(($event->status ?? 'draft'), ['published', 'cancelled']))
                                        <form action="{{ route('community.events.archive', $event) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin mengarsipkan event ini?')">
                                            @csrf
                                            <button type="submit" class="text-komuna-info hover:text-komuna-info text-sm font-medium">Archive</button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $events->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">📅</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Event</h3>
        <p class="text-komuna-muted text-sm mb-4">Buat event pertama untuk komunitas Anda.</p>
        <a href="{{ route('community.events.create') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Buat Event
        </a>
    </div>
@endif
@endsection
