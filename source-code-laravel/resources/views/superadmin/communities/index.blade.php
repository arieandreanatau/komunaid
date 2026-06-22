@extends('layouts.app')
@section('title', 'Komunitas - Superadmin')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Data Komunitas</h1>
    <form method="GET" class="flex gap-4 mb-6">
        <select name="status" class="px-4 py-2 border rounded-lg">
            <option value="">Semua Status</option>
            <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
            <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Approved</option>
            <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Rejected</option>
        </select>
        <button class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg">Filter</button>
    </form>
    <div class="bg-white rounded-xl border overflow-hidden">
        <table class="w-full">
            <thead class="bg-soft-bg">
                <tr>
                    <th class="text-left p-3 text-sm font-medium text-navy">#</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Nama</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Owner</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Anggota</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Status</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($communities as $i => $community)
                    <tr class="hover:bg-gray-50">
                        <td class="p-3 text-sm">{{ $i + $communities->firstItem() }}</td>
                        <td class="p-3 text-sm font-medium">{{ $community->name }}</td>
                        <td class="p-3 text-sm text-gray-500">{{ $community->owner->name }}</td>
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
                        <td class="p-3 flex gap-1">
                            @if($community->status === 'pending')
                                <form action="{{ route('superadmin.communities.approve', $community->id) }}" method="POST">
                                    @csrf @method('PUT')
                                    <button class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                                </form>
                                <form action="{{ route('superadmin.communities.reject', $community->id) }}" method="POST">
                                    @csrf @method('PUT')
                                    <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                                </form>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="p-4 text-center text-gray-400">Tidak ada data.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $communities->withQueryString()->links() }}</div>
</div>
@endsection
