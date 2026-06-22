@extends('layouts.app')
@section('title', 'Role Requests - Superadmin')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Role Requests</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="bg-white rounded-xl border overflow-hidden">
        <table class="w-full">
            <thead class="bg-soft-bg">
                <tr>
                    <th class="text-left p-3 text-sm font-medium text-navy">#</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">User</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Role Diminta</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Alasan</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Status</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($roleRequests as $i => $req)
                    <tr class="hover:bg-gray-50">
                        <td class="p-3 text-sm">{{ $i + $roleRequests->firstItem() }}</td>
                        <td class="p-3 text-sm font-medium">{{ $req->user->name }}</td>
                        <td class="p-3 text-sm">{{ ucfirst(str_replace('_', ' ', $req->requested_role)) }}</td>
                        <td class="p-3 text-sm text-gray-500 max-w-xs truncate">{{ $req->reason }}</td>
                        <td class="p-3 text-sm">
                            @if($req->status === 'approved')
                                <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Approved</span>
                            @elseif($req->status === 'pending')
                                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                            @else
                                <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Rejected</span>
                            @endif
                        </td>
                        <td class="p-3 flex gap-1">
                            @if($req->status === 'pending')
                                <form action="{{ route('superadmin.role-requests.approve', $req->id) }}" method="POST">
                                    @csrf @method('PUT')
                                    <button class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                                </form>
                                <form action="{{ route('superadmin.role-requests.reject', $req->id) }}" method="POST">
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
    <div class="mt-4">{{ $roleRequests->withQueryString()->links() }}</div>
</div>
@endsection
