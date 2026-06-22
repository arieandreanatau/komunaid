@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Collaboration Requests</h1>
        <p class="text-gray-600">Kelola collaboration masuk dan keluar dari komunitas Anda.</p>
    </div>
    <a href="{{ route('community.collaborations.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Ajukan Collaboration
    </a>
</div>

<div class="space-y-8">
    <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Incoming Requests</h2>
        @if($incoming->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dari</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($incoming as $collab)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        @if($collab->brand)
                                            {{ $collab->brand->name }} (Brand)
                                        @elseif($collab->senderCommunity)
                                            {{ $collab->senderCommunity->name }} (Komunitas)
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td class="px-6 py-4">
                                        <a href="{{ route('community.collaborations.show', $collab) }}" class="font-semibold text-sm text-emerald-600 hover:text-emerald-800">{{ $collab->title }}</a>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-600">{{ $collab->collaboration_type }}</td>
                                    <td class="px-6 py-4">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium
                                            @if($collab->status === 'pending') bg-yellow-100 text-yellow-800
                                            @elseif($collab->status === 'accepted') bg-green-100 text-green-800
                                            @elseif($collab->status === 'rejected') bg-red-100 text-red-800
                                            @elseif($collab->status === 'cancelled') bg-gray-100 text-gray-800
                                            @else bg-blue-100 text-blue-800
                                            @endif">
                                            {{ ucfirst($collab->status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <a href="{{ route('community.collaborations.show', $collab) }}" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Detail</a>
                                            @if($collab->status === 'pending')
                                                <form action="{{ route('community.collaborations.accept', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" class="text-green-600 hover:text-green-800 text-sm font-medium">Accept</button>
                                                </form>
                                                <form action="{{ route('community.collaborations.reject', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" class="text-red-600 hover:text-red-800 text-sm font-medium">Reject</button>
                                                </form>
                                            @endif
                                            @if($collab->status === 'accepted')
                                                <form action="{{ route('community.collaborations.complete', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Selesai</button>
                                                </form>
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-100">
                    {{ $incoming->links() }}
                </div>
            </div>
        @else
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                <p class="text-gray-500 text-sm">Belum ada collaboration request masuk.</p>
            </div>
        @endif
    </div>

    <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Outgoing Requests</h2>
        @if($outgoing->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ke</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($outgoing as $collab)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 text-sm text-gray-900">{{ $collab->community->name ?? '-' }}</td>
                                    <td class="px-6 py-4">
                                        <a href="{{ route('community.collaborations.show', $collab) }}" class="font-semibold text-sm text-emerald-600 hover:text-emerald-800">{{ $collab->title }}</a>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium
                                            @if($collab->status === 'pending') bg-yellow-100 text-yellow-800
                                            @elseif($collab->status === 'accepted') bg-green-100 text-green-800
                                            @elseif($collab->status === 'rejected') bg-red-100 text-red-800
                                            @elseif($collab->status === 'cancelled') bg-gray-100 text-gray-800
                                            @else bg-blue-100 text-blue-800
                                            @endif">
                                            {{ ucfirst($collab->status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <a href="{{ route('community.collaborations.show', $collab) }}" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Detail</a>
                                            @if($collab->status === 'pending')
                                                <form action="{{ route('community.collaborations.cancel', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" onclick="return confirm('Batalkan request ini?')" class="text-red-600 hover:text-red-800 text-sm font-medium">Batal</button>
                                                </form>
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-100">
                    {{ $outgoing->links() }}
                </div>
            </div>
        @else
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                <p class="text-gray-500 text-sm">Belum ada collaboration request keluar.</p>
            </div>
        @endif
    </div>
</div>
@endsection
