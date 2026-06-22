@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
    <p class="text-gray-600">Kelola semua pengguna platform</p>
</div>

<div class="bg-white rounded-xl shadow-sm p-6 mb-6">
    <form method="GET" action="{{ route('superadmin.users.index') }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nama atau email..."
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
        </div>
        <div class="min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select name="role" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Semua Role</option>
                <option value="superadmin" {{ request('role') === 'superadmin' ? 'selected' : '' }}>Superadmin</option>
                <option value="community_owner" {{ request('role') === 'community_owner' ? 'selected' : '' }}>Community Owner</option>
                <option value="brand_owner" {{ request('role') === 'brand_owner' ? 'selected' : '' }}>Brand Owner</option>
                <option value="member" {{ request('role') === 'member' ? 'selected' : '' }}>Member</option>
            </select>
        </div>
        <div class="min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Semua Status</option>
                <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                <option value="suspended" {{ request('status') === 'suspended' ? 'selected' : '' }}>Suspended</option>
            </select>
        </div>
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Filter</button>
        <a href="{{ route('superadmin.users.index') }}" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">Reset</a>
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($users as $user)
                    <tr>
                        <td class="px-4 py-3 text-sm font-medium text-gray-900">
                            <a href="{{ route('superadmin.users.show', $user) }}" class="hover:text-emerald-600">{{ $user->name }}</a>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ $user->email }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {{ $user->roles->pluck('name')->map(fn($r) => ucfirst(str_replace('_', ' ', $r)))->implode(', ') ?: 'Member' }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            @if($user->banned_at)
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended</span>
                            @else
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                            @endif
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ $user->created_at->format('d M Y') }}</td>
                        <td class="px-4 py-3">
                            <div class="flex space-x-1">
                                @if($user->banned_at)
                                    <form method="POST" action="{{ route('superadmin.users.activate', $user) }}">
                                        @csrf
                                        <button type="submit" class="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Aktifkan user {{ $user->name }}?')">Activate</button>
                                    </form>
                                @else
                                    <form method="POST" action="{{ route('superadmin.users.suspend', $user) }}">
                                        @csrf
                                        <button type="submit" class="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600" onclick="return confirm('Suspend user {{ $user->name }}?')">Suspend</button>
                                    </form>
                                    <form method="POST" action="{{ route('superadmin.users.ban', $user) }}">
                                        @csrf
                                        <button type="submit" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Ban user {{ $user->name }}?')">Ban</button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-4 py-8 text-center text-gray-500">Tidak ada user ditemukan.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="p-4">
        {{ $users->withQueryString()->links() }}
    </div>
</div>
@endsection
