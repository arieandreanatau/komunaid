@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Collaboration Requests</h1>
        <p class="text-gray-600">Kelola pengajuan kolaborasi ke komunitas.</p>
    </div>
    <a href="{{ route('brand.collaborations.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Ajukan Kolaborasi
    </a>
</div>

<div class="flex items-center gap-2 mb-6">
    <a href="{{ route('brand.collaborations.index') }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('status') ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Semua</a>
    <a href="{{ route('brand.collaborations.index', ['status' => 'pending']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Pending</a>
    <a href="{{ route('brand.collaborations.index', ['status' => 'accepted']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Accepted</a>
    <a href="{{ route('brand.collaborations.index', ['status' => 'rejected']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Rejected</a>
</div>

@if($collaborations->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komunitas</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($collaborations as $collab)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <a href="{{ route('brand.collaborations.show', $collab) }}" class="font-semibold text-gray-900 text-sm hover:text-indigo-600">{{ $collab->title }}</a>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $collab->brand->name }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $collab->community->name }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($collab->collaboration_type === 'free_collaboration') bg-emerald-100 text-emerald-800
                                    @elseif($collab->collaboration_type === 'paid_collaboration') bg-blue-100 text-blue-800
                                    @elseif($collab->collaboration_type === 'sponsorship') bg-purple-100 text-purple-800
                                    @elseif($collab->collaboration_type === 'csr_donation') bg-orange-100 text-orange-800
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
                                    @if($collab->status === 'accepted') bg-green-100 text-green-800
                                    @elseif($collab->status === 'pending') bg-yellow-100 text-yellow-800
                                    @elseif($collab->status === 'rejected') bg-red-100 text-red-800
                                    @else bg-gray-100 text-gray-800
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
                                            <button type="submit" class="text-red-600 hover:text-red-800 text-sm font-medium">Batal</button>
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
            {{ $collaborations->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">🤝</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Collaboration Request</h3>
        <p class="text-gray-500 text-sm mb-4">Ajukan kolaborasi ke komunitas pertama Anda.</p>
        <a href="{{ route('brand.collaborations.create') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Ajukan Kolaborasi
        </a>
    </div>
@endif
@endsection
