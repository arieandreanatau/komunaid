@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Event Management</h1>
        <p class="text-gray-600">Kelola semua event dari komunitas Anda.</p>
    </div>
    <a href="{{ route('community.events.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Buat Event
    </a>
</div>

<div class="flex gap-2 mb-6">
    <a href="{{ route('community.events.index') }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('status') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Semua</a>
    <a href="{{ route('community.events.index', ['status' => 'approved']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Approved</a>
    <a href="{{ route('community.events.index', ['status' => 'pending']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Pending</a>
</div>

@if($events->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komunitas</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($events as $event)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <a href="{{ route('community.events.show', $event) }}" class="font-semibold text-gray-900 text-sm hover:text-emerald-600">{{ $event->title }}</a>
                                <p class="text-xs text-gray-500">{{ Str::limit($event->description, 50) }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $event->community->name ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($event->event_type === 'paid') bg-purple-100 text-purple-800
                                    @elseif($event->event_type === 'free') bg-green-100 text-green-800
                                    @else bg-blue-100 text-blue-800
                                    @endif">
                                    {{ ucfirst($event->event_type) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ ucfirst($event->location_type) }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $event->start_datetime->format('d M Y H:i') }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($event->approval_status === 'approved') bg-green-100 text-green-800
                                    @elseif($event->approval_status === 'pending') bg-yellow-100 text-yellow-800
                                    @else bg-red-100 text-red-800
                                    @endif">
                                    {{ ucfirst($event->approval_status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('community.events.show', $event) }}" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Detail</a>
                                    <a href="{{ route('community.events.edit', $event) }}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</a>
                                    <a href="{{ route('community.events.registrations', $event) }}" class="text-purple-600 hover:text-purple-800 text-sm font-medium">Regis</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
            {{ $events->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">📅</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Event</h3>
        <p class="text-gray-500 text-sm mb-4">Buat event pertama untuk komunitas Anda.</p>
        <a href="{{ route('community.events.create') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Buat Event
        </a>
    </div>
@endif
@endsection
