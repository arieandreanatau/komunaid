@extends('layouts.app')
@section('title', 'Approval Center')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Approval Center</h1>

    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif

    {{-- Pending Communities --}}
    <div class="bg-white rounded-xl border mb-6">
        <div class="p-4 border-b bg-soft-bg rounded-t-xl">
            <h2 class="font-bold text-navy">Komunitas Pending ({{ $pendingCommunities->count() }})</h2>
        </div>
        @if($pendingCommunities->count())
            <div class="divide-y">
                @foreach($pendingCommunities as $community)
                    <div class="p-4 flex items-center justify-between">
                        <div>
                            <div class="font-medium">{{ $community->name }}</div>
                            <div class="text-sm text-gray-400">Oleh: {{ $community->owner->name }} &bull; {{ $community->category }}</div>
                        </div>
                        <div class="flex gap-2">
                            <form action="{{ route('superadmin.communities.approve', $community->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                            </form>
                            <form action="{{ route('superadmin.communities.reject', $community->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="p-4 text-gray-400 text-sm">Tidak ada komunitas pending.</div>
        @endif
    </div>

    {{-- Pending Brands --}}
    <div class="bg-white rounded-xl border mb-6">
        <div class="p-4 border-b bg-soft-bg rounded-t-xl">
            <h2 class="font-bold text-navy">Brand Pending ({{ $pendingBrands->count() }})</h2>
        </div>
        @if($pendingBrands->count())
            <div class="divide-y">
                @foreach($pendingBrands as $brand)
                    <div class="p-4 flex items-center justify-between">
                        <div>
                            <div class="font-medium">{{ $brand->name }}</div>
                            <div class="text-sm text-gray-400">Oleh: {{ $brand->owner->name }} &bull; {{ $brand->industry }}</div>
                        </div>
                        <div class="flex gap-2">
                            <form action="{{ route('superadmin.brands.approve', $brand->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                            </form>
                            <form action="{{ route('superadmin.brands.reject', $brand->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="p-4 text-gray-400 text-sm">Tidak ada brand pending.</div>
        @endif
    </div>

    {{-- Pending Events --}}
    <div class="bg-white rounded-xl border mb-6">
        <div class="p-4 border-b bg-soft-bg rounded-t-xl">
            <h2 class="font-bold text-navy">Event Pending ({{ $pendingEvents->count() }})</h2>
        </div>
        @if($pendingEvents->count())
            <div class="divide-y">
                @foreach($pendingEvents as $event)
                    <div class="p-4 flex items-center justify-between">
                        <div>
                            <div class="font-medium">{{ $event->title }}</div>
                            <div class="text-sm text-gray-400">{{ $event->community->name }} &bull; {{ $event->start_date->format('d M Y') }}</div>
                        </div>
                        <div class="flex gap-2">
                            <form action="{{ route('superadmin.events.approve', $event->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                            </form>
                            <form action="{{ route('superadmin.events.reject', $event->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="p-4 text-gray-400 text-sm">Tidak ada event pending.</div>
        @endif
    </div>

    {{-- Pending Role Requests --}}
    <div class="bg-white rounded-xl border">
        <div class="p-4 border-b bg-soft-bg rounded-t-xl">
            <h2 class="font-bold text-navy">Role Requests Pending ({{ $pendingRoleRequests->count() }})</h2>
        </div>
        @if($pendingRoleRequests->count())
            <div class="divide-y">
                @foreach($pendingRoleRequests as $req)
                    <div class="p-4 flex items-center justify-between">
                        <div>
                            <div class="font-medium">{{ $req->user->name }}</div>
                            <div class="text-sm text-gray-400">Minta role: {{ $req->requested_role }} &bull; {{ $req->reason }}</div>
                        </div>
                        <div class="flex gap-2">
                            <form action="{{ route('superadmin.role-requests.approve', $req->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                            </form>
                            <form action="{{ route('superadmin.role-requests.reject', $req->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="p-4 text-gray-400 text-sm">Tidak ada role request pending.</div>
        @endif
    </div>
</div>
@endsection
