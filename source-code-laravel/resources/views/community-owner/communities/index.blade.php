@extends('layouts.app')
@section('title', 'Komunitas Saya')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-navy">Komunitas Saya</h1>
        <a href="{{ route('community-owner.communities.create') }}" class="bg-blue hover:bg-navy text-white px-4 py-2 rounded-lg transition">+ Buat Komunitas</a>
    </div>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="bg-white rounded-xl border overflow-hidden">
        <table class="w-full">
            <thead class="bg-soft-bg">
                <tr>
                    <th class="text-left p-3 text-sm font-medium text-navy">Nama</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Anggota</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Status</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($communities as $community)
                    <tr class="hover:bg-gray-50">
                        <td class="p-3 text-sm font-medium">{{ $community->name }}</td>
                        <td class="p-3 text-sm">{{ $community->members_count }}</td>
                        <td class="p-3 text-sm">
                            @if($community->status === 'approved')
                                <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Approved</span>
                            @elseif($community->status === 'pending')
                                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                            @else
                                <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Rejected</span>
                            @endif
                        </td>
                        <td class="p-3 flex gap-2">
                            <a href="{{ route('community-owner.communities.edit', $community->id) }}" class="text-blue text-xs hover:underline">Edit</a>
                            <a href="{{ route('community-owner.communities.members.index', $community->id) }}" class="text-blue text-xs hover:underline">Members</a>
                            <a href="{{ route('community-owner.communities.events.index', $community->id) }}" class="text-blue text-xs hover:underline">Events</a>
                            <a href="{{ route('community-owner.communities.posts.index', $community->id) }}" class="text-blue text-xs hover:underline">Posts</a>
                            <a href="{{ route('community-owner.communities.messages.index', $community->id) }}" class="text-blue text-xs hover:underline">Chat</a>
                            <a href="{{ route('community-owner.communities.collaborations.index', $community->id) }}" class="text-blue text-xs hover:underline">Collabs</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="p-4 text-center text-gray-400">Belum ada komunitas.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $communities->links() }}</div>
</div>
@endsection
