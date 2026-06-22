@extends('layouts.app')

@section('content')
<div class="mb-8">
    <a href="{{ route('superadmin.users.index') }}" class="text-sm text-emerald-600 hover:text-emerald-800">&larr; Kembali ke User Management</a>
    <h1 class="text-2xl font-bold text-gray-900 mt-2">Detail User</h1>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <dl class="space-y-3">
            <div>
                <dt class="text-sm text-gray-500">Name</dt>
                <dd class="text-sm font-medium text-gray-900">{{ $user->name }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Email</dt>
                <dd class="text-sm text-gray-900">{{ $user->email }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Roles</dt>
                <dd class="flex flex-wrap gap-1 mt-1">
                    @forelse($user->roles as $role)
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{{ ucfirst(str_replace('_', ' ', $role->name)) }}</span>
                    @empty
                        <span class="text-xs text-gray-400">Member</span>
                    @endforelse
                </dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Status</dt>
                <dd>
                    @if($user->banned_at)
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended/Banned</span>
                    @else
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                    @endif
                </dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Joined</dt>
                <dd class="text-sm text-gray-900">{{ $user->created_at->format('d M Y H:i') }}</dd>
            </div>
        </dl>

        <div class="mt-6 space-y-2">
            @if($user->banned_at)
                <form method="POST" action="{{ route('superadmin.users.activate', $user) }}">
                    @csrf
                    <button type="submit" class="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600" onclick="return confirm('Aktifkan user ini?')">Activate User</button>
                </form>
            @else
                <form method="POST" action="{{ route('superadmin.users.suspend', $user) }}">
                    @csrf
                    <button type="submit" class="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600" onclick="return confirm('Suspend user ini?')">Suspend User</button>
                </form>
                <form method="POST" action="{{ route('superadmin.users.ban', $user) }}">
                    @csrf
                    <button type="submit" class="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600" onclick="return confirm('Ban user ini? Tindakan ini akan memblokir akses user.')">Ban User</button>
                </form>
            @endif
        </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
        @if($user->ownedCommunities->count() > 0)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Owned Communities ({{ $user->ownedCommunities->count() }})</h2>
                <div class="space-y-2">
                    @foreach($user->ownedCommunities as $community)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $community->name }}</p>
                                <p class="text-xs text-gray-500">{{ ucfirst($community->status) }}</p>
                            </div>
                            <a href="{{ route('superadmin.communities.show', $community) }}" class="text-emerald-600 hover:text-emerald-800 text-xs">Detail</a>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        @if($user->ownedBrands->count() > 0)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Owned Brands ({{ $user->ownedBrands->count() }})</h2>
                <div class="space-y-2">
                    @foreach($user->ownedBrands as $brand)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $brand->name }}</p>
                                <p class="text-xs text-gray-500">{{ ucfirst($brand->status) }}</p>
                            </div>
                            <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-emerald-600 hover:text-emerald-800 text-xs">Detail</a>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Role Request History</h2>
            @if($roleRequestHistory->isEmpty())
                <p class="text-gray-500 text-center py-4">Tidak ada role request.</p>
            @else
                <div class="space-y-2">
                    @foreach($roleRequestHistory as $req)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ ucfirst(str_replace('_', ' ', $req->requested_role)) }}</p>
                                <p class="text-xs text-gray-500">{{ $req->created_at->format('d M Y H:i') }}</p>
                            </div>
                            @if($req->status === 'pending')
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                            @elseif($req->status === 'approved')
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                            @else
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                            @endif
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
