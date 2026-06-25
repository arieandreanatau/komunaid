@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Collaboration Requests</h1>
        <p class="text-komuna-muted">Kelola collaboration masuk dan keluar dari komunitas Anda.</p>
    </div>
    <a href="{{ route('community.collaborations.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Ajukan Collaboration
    </a>
</div>

<div class="space-y-8">
    <div>
        <h2 class="text-lg font-semibold text-komuna-text mb-4">Incoming Requests</h2>
        @if($incoming->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-komuna-surface">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Dari</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Judul</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tipe</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($incoming as $collab)
                                <tr class="hover:bg-komuna-surface">
                                    <td class="px-6 py-4 text-sm text-komuna-text">
                                        @if($collab->brand)
                                            {{ $collab->brand->name }} (Brand)
                                        @elseif($collab->senderCommunity)
                                            {{ $collab->senderCommunity->name }} (Komunitas)
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td class="px-6 py-4">
                                        <a href="{{ route('community.collaborations.show', $collab) }}" class="font-semibold text-sm text-komuna-success hover:text-komuna-success">{{ $collab->title }}</a>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-komuna-muted">{{ $collab->collaboration_type }}</td>
                                    <td class="px-6 py-4">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium
                                            @if($collab->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                            @elseif($collab->status === 'accepted') bg-komuna-success-soft text-komuna-success
                                            @elseif($collab->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                            @elseif($collab->status === 'cancelled') bg-komuna-border-soft text-komuna-text
                                            @else bg-komuna-light text-komuna-blue
                                            @endif">
                                            {{ ucfirst($collab->status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <a href="{{ route('community.collaborations.show', $collab) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Detail</a>
                                            @if($collab->status === 'pending')
                                                <form action="{{ route('community.collaborations.accept', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Accept</button>
                                                </form>
                                                <form action="{{ route('community.collaborations.reject', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Reject</button>
                                                </form>
                                            @endif
                                            @if($collab->status === 'accepted')
                                                <form action="{{ route('community.collaborations.complete', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Selesai</button>
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
                    {{ $incoming->links() }}
                </div>
            </div>
        @else
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 text-center">
                <p class="text-komuna-muted text-sm">Belum ada collaboration request masuk.</p>
            </div>
        @endif
    </div>

    <div>
        <h2 class="text-lg font-semibold text-komuna-text mb-4">Outgoing Requests</h2>
        @if($outgoing->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-komuna-surface">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Ke</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Judul</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($outgoing as $collab)
                                <tr class="hover:bg-komuna-surface">
                                    <td class="px-6 py-4 text-sm text-komuna-text">{{ $collab->community->name ?? '-' }}</td>
                                    <td class="px-6 py-4">
                                        <a href="{{ route('community.collaborations.show', $collab) }}" class="font-semibold text-sm text-komuna-success hover:text-komuna-success">{{ $collab->title }}</a>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium
                                            @if($collab->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                            @elseif($collab->status === 'accepted') bg-komuna-success-soft text-komuna-success
                                            @elseif($collab->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                            @elseif($collab->status === 'cancelled') bg-komuna-border-soft text-komuna-text
                                            @else bg-komuna-light text-komuna-blue
                                            @endif">
                                            {{ ucfirst($collab->status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <a href="{{ route('community.collaborations.show', $collab) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Detail</a>
                                            @if($collab->status === 'pending')
                                                <form action="{{ route('community.collaborations.cancel', $collab) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" onclick="return confirm('Batalkan request ini?')" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Batal</button>
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
                    {{ $outgoing->links() }}
                </div>
            </div>
        @else
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 text-center">
                <p class="text-komuna-muted text-sm">Belum ada collaboration request keluar.</p>
            </div>
        @endif
    </div>
</div>
@endsection
