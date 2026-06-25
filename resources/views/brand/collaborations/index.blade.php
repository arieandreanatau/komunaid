@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Collaboration Requests</h1>
        <p class="text-komuna-muted">Kelola pengajuan kolaborasi ke komunitas.</p>
    </div>
    <a href="{{ route('brand.collaborations.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Ajukan Kolaborasi
    </a>
</div>

<div class="flex items-center gap-2 mb-6">
    <a href="{{ route('brand.collaborations.index') }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('status') ? 'bg-komuna-success-soft text-emerald-700' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Semua</a>
    <a href="{{ route('brand.collaborations.index', ['status' => 'pending']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'pending' ? 'bg-komuna-warning-soft text-komuna-warning' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Pending</a>
    <a href="{{ route('brand.collaborations.index', ['status' => 'accepted']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'accepted' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Accepted</a>
    <a href="{{ route('brand.collaborations.index', ['status' => 'rejected']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'rejected' ? 'bg-komuna-danger-soft text-komuna-danger' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Rejected</a>
</div>

@if($collaborations->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Judul</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Komunitas</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($collaborations as $collab)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <a href="{{ route('brand.collaborations.show', $collab) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-blue">{{ $collab->title }}</a>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $collab->brand->name }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $collab->community->name }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($collab->collaboration_type === 'free_collaboration') bg-komuna-success-soft text-komuna-success
                                    @elseif($collab->collaboration_type === 'paid_collaboration') bg-komuna-light text-komuna-blue
                                    @elseif($collab->collaboration_type === 'sponsorship') bg-komuna-info-soft text-komuna-info
                                    @elseif($collab->collaboration_type === 'csr_donation') bg-komuna-warning-soft text-orange-800
                                    @else bg-teal-100 text-teal-800
                                    @endif">
                                    @switch($collab->collaboration_type)
                                        @case('free_collaboration') Free Collab @break
                                        @case('paid_collaboration') Paid Collab @break
                                        @case('sponsorship') Sponsorship @break
                                        @case('csr_donation') CSR Donation @break
                                        @case('tap_in_event') Tap-in Event @break
                                        @default {{ $collab->collaboration_type }}
                                    @endswitch
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($collab->status === 'accepted') bg-komuna-success-soft text-komuna-success
                                    @elseif($collab->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                    @elseif($collab->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                    @else bg-komuna-border-soft text-komuna-text
                                    @endif">
                                    {{ ucfirst($collab->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('brand.collaborations.show', $collab) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a>
                                    @if($collab->status === 'pending')
                                        <form action="{{ route('brand.collaborations.destroy', $collab) }}" method="POST" onsubmit="return confirm('Yakin ingin membatalkan?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Batal</button>
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
            {{ $collaborations->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">🤝</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Collaboration Request</h3>
        <p class="text-komuna-muted text-sm mb-4">Ajukan kolaborasi ke komunitas pertama Anda.</p>
        <a href="{{ route('brand.collaborations.create') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Ajukan Kolaborasi
        </a>
    </div>
@endif
@endsection
