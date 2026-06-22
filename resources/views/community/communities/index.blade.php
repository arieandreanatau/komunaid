@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Komunitas Saya</h1>
        <p class="text-gray-600">Kelola semua komunitas yang Anda miliki.</p>
    </div>
    <a href="{{ route('community.communities.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        + Buat Komunitas
    </a>
</div>

@if($communities->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komunitas</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($communities as $community)
                        <tr class="hover:bg-gray-50">
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
                                        <a href="{{ route('community.communities.show', $community) }}" class="font-semibold text-gray-900 text-sm hover:text-emerald-600">{{ $community->name }}</a>
                                        <p class="text-xs text-gray-500">{{ $community->city ?? '-' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $community->category->name ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($community->status === 'approved') bg-green-100 text-green-800
                                    @elseif($community->status === 'pending') bg-yellow-100 text-yellow-800
                                    @elseif($community->status === 'rejected') bg-red-100 text-red-800
                                    @else bg-gray-100 text-gray-800
                                    @endif">
                                    {{ ucfirst($community->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ ucfirst($community->community_type) }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $community->activeMembers->count() }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('community.communities.show', $community) }}" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Detail</a>
                                    <a href="{{ route('community.communities.edit', $community) }}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</a>
                                    <a href="{{ route('community.members.index', $community) }}" class="text-purple-600 hover:text-purple-800 text-sm font-medium">Anggota</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
            {{ $communities->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">🏘</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Komunitas</h3>
        <p class="text-gray-500 text-sm mb-4">Buat komunitas pertama Anda.</p>
        <a href="{{ route('community.communities.create') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Buat Komunitas
        </a>
    </div>
@endif
@endsection
