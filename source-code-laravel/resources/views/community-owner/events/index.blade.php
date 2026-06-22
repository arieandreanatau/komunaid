@extends('layouts.app')
@section('title', 'Events - ' . $community->name)
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-navy">Events: {{ $community->name }}</h1>
        <a href="{{ route('community-owner.communities.events.create', $community->id) }}" class="bg-blue hover:bg-navy text-white px-4 py-2 rounded-lg transition">+ Buat Event</a>
    </div>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="bg-white rounded-xl border overflow-hidden">
        <table class="w-full">
            <thead class="bg-soft-bg">
                <tr>
                    <th class="text-left p-3 text-sm font-medium text-navy">Judul</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Tanggal</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Lokasi</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Status</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($events as $event)
                    <tr class="hover:bg-gray-50">
                        <td class="p-3 text-sm font-medium">{{ $event->title }}</td>
                        <td class="p-3 text-sm">{{ $event->start_date->format('d M Y H:i') }}</td>
                        <td class="p-3 text-sm text-gray-500">{{ $event->location }}</td>
                        <td class="p-3 text-sm">
                            @if($event->status === 'approved')
                                <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Approved</span>
                            @elseif($event->status === 'pending')
                                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                            @else
                                <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">{{ ucfirst($event->status) }}</span>
                            @endif
                        </td>
                        <td class="p-3 flex gap-2">
                            <a href="{{ route('community-owner.communities.events.edit', [$community->id, $event->id]) }}" class="text-blue text-xs hover:underline">Edit</a>
                            <form action="{{ route('community-owner.communities.events.destroy', [$community->id, $event->id]) }}" method="POST" onsubmit="return confirm('Hapus event?')">
                                @csrf @method('DELETE')
                                <button class="text-red-500 text-xs hover:underline">Hapus</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-4 text-center text-gray-400">Belum ada event.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $events->links() }}</div>
</div>
@endsection
