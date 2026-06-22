@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Role Requests</h1>
    <p class="text-gray-600">Kelola permintaan role dari member</p>
</div>

<div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex justify-between items-center mb-4">
        <div class="flex space-x-2">
            <a href="{{ route('superadmin.role-requests.index') }}" class="px-3 py-1 rounded-lg text-sm {{ !request('status') ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }}">Semua</a>
            <a href="{{ route('superadmin.role-requests.index', ['status' => 'pending']) }}" class="px-3 py-1 rounded-lg text-sm {{ request('status') === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }}">Pending</a>
            <a href="{{ route('superadmin.role-requests.index', ['status' => 'approved']) }}" class="px-3 py-1 rounded-lg text-sm {{ request('status') === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }}">Approved</a>
            <a href="{{ route('superadmin.role-requests.index', ['status' => 'rejected']) }}" class="px-3 py-1 rounded-lg text-sm {{ request('status') === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }}">Rejected</a>
        </div>
    </div>

    @if($roleRequests->isEmpty())
        <p class="text-gray-500 text-center py-8">Tidak ada role request.</p>
    @else
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Role</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($roleRequests as $req)
                        <tr>
                            <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ $req->user->name }}</td>
                            <td class="px-4 py-3 text-sm text-gray-600">{{ $req->user->email }}</td>
                            <td class="px-4 py-3 text-sm text-gray-600">{{ ucfirst(str_replace('_', ' ', $req->requested_role)) }}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($req->status === 'pending') bg-yellow-100 text-yellow-800
                                    @elseif($req->status === 'approved') bg-green-100 text-green-800
                                    @else bg-red-100 text-red-800
                                    @endif">
                                    {{ ucfirst($req->status) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500">{{ $req->created_at->format('d M Y H:i') }}</td>
                            <td class="px-4 py-3">
                                @if($req->status === 'pending')
                                    <div class="flex space-x-2">
                                        <form method="POST" action="{{ route('superadmin.role-requests.approve', $req) }}">
                                            @csrf
                                            <button type="submit" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Approve request ini?')">Approve</button>
                                        </form>
                                        <form method="POST" action="{{ route('superadmin.role-requests.reject', $req) }}">
                                            @csrf
                                            <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Reject request ini?')">Reject</button>
                                        </form>
                                    </div>
                                @else
                                    <span class="text-sm text-gray-500">
                                        {{ $req->reviewer ? 'By ' . $req->reviewer->name : '-' }}
                                    </span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="mt-4">
            {{ $roleRequests->links() }}
        </div>
    @endif
</div>
@endsection
