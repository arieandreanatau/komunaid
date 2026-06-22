@extends('layouts.app')

@section('content')
<div class="mb-8">
    <a href="{{ route('superadmin.communities.index') }}" class="text-sm text-emerald-600 hover:text-emerald-800">&larr; Kembali ke Community Management</a>
    <h1 class="text-2xl font-bold text-gray-900 mt-2">{{ $community->name }}</h1>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Info</h2>
        <dl class="space-y-3">
            <div>
                <dt class="text-sm text-gray-500">Owner</dt>
                <dd class="text-sm font-medium text-gray-900">{{ $community->owner->name ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Category</dt>
                <dd class="text-sm text-gray-900">{{ $community->category->name ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Status</dt>
                <dd>
                    @if($community->status === 'pending')
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                    @elseif($community->status === 'approved')
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                    @else
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{{ ucfirst($community->status) }}</span>
                    @endif
                </dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Active Members</dt>
                <dd class="text-sm text-gray-900">{{ $membersCount }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Events</dt>
                <dd class="text-sm text-gray-900">{{ $community->events->count() }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Created</dt>
                <dd class="text-sm text-gray-900">{{ $community->created_at->format('d M Y') }}</dd>
            </div>
        </dl>

        <div class="mt-6 space-y-2">
            @if($community->status !== 'approved')
                <form method="POST" action="{{ route('superadmin.communities.approve', $community) }}">
                    @csrf
                    <button type="submit" class="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600" onclick="return confirm('Approve komunitas ini?')">Approve</button>
                </form>
            @endif
            @if($community->status !== 'rejected')
                <form method="POST" action="{{ route('superadmin.communities.reject', $community) }}">
                    @csrf
                    <button type="submit" class="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600" onclick="return confirm('Reject komunitas ini?')">Reject</button>
                </form>
            @endif
            @if($community->status !== 'archived')
                <form method="POST" action="{{ route('superadmin.communities.suspend', $community) }}">
                    @csrf
                    <button type="submit" class="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600" onclick="return confirm('Suspend komunitas ini?')">Suspend</button>
                </form>
            @endif
            <form method="POST" action="{{ route('superadmin.communities.destroy', $community) }}">
                @csrf
                @method('DELETE')
                <button type="submit" class="w-full bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900" onclick="return confirm('Hapus komunitas ini? Data akan di-soft delete.')">Delete (Soft Delete)</button>
            </form>
        </div>
    </div>

    <div class="lg:col-span-2">
        @if($community->description)
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p class="text-sm text-gray-700">{{ $community->description }}</p>
            </div>
        @endif

        <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Members</h2>
            @if($community->members->isEmpty())
                <p class="text-gray-500 text-center py-4">Belum ada anggota.</p>
            @else
                <div class="space-y-2">
                    @foreach($community->members->take(10) as $member)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $member->user->name ?? 'Unknown' }}</p>
                                <p class="text-xs text-gray-500">{{ ucfirst($member->role) }} - {{ ucfirst($member->status) }}</p>
                            </div>
                            <span class="text-xs text-gray-400">{{ $member->joined_at?->format('d M Y') ?? '-' }}</span>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
