@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Komunitas Saya</h1>
        <p class="text-komuna-muted">Kelola semua komunitas yang Anda miliki.</p>
    </div>
    <a href="{{ route('community.communities.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Buat Komunitas
    </a>
</div>

@if($communities->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Komunitas</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Kategori</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Member</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($communities as $community)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                                        @if($community->logo)
                                            <img src="{{ Storage::url($community->logo) }}" alt="" class="w-full h-full object-cover">
                                        @else
                                            {{ substr($community->name, 0, 1) }}
                                        @endif
                                    </div>
                                    <div>
                                        <a href="{{ route('community.communities.show', $community) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-success">{{ $community->name }}</a>
                                        <p class="text-xs text-komuna-muted">{{ $community->city ?? '-' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $community->category->name ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($community->status === 'approved') bg-komuna-success-soft text-komuna-success
                                    @elseif($community->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                    @elseif($community->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                    @else bg-komuna-border-soft text-komuna-text
                                    @endif">
                                    {{ ucfirst($community->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ ucfirst($community->community_type) }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $community->activeMembers->count() }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('community.communities.show', $community) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Detail</a>
                                    <a href="{{ route('community.communities.edit', $community) }}" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Edit</a>
                                    <a href="{{ route('community.members.index', $community) }}" class="text-komuna-info hover:text-komuna-info text-sm font-medium">Anggota</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $communities->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">🏘</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Komunitas</h3>
        <p class="text-komuna-muted text-sm mb-4">Buat komunitas pertama Anda.</p>
        <a href="{{ route('community.communities.create') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Buat Komunitas
        </a>
    </div>
@endif
@endsection
