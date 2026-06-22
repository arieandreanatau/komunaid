@extends('layouts.app')

@section('content')
<div class="mb-8">
    <a href="{{ route('superadmin.brands.index') }}" class="text-sm text-emerald-600 hover:text-emerald-800">&larr; Kembali ke Brand Management</a>
    <h1 class="text-2xl font-bold text-gray-900 mt-2">{{ $brand->name }}</h1>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Info</h2>
        <dl class="space-y-3">
            <div>
                <dt class="text-sm text-gray-500">Owner</dt>
                <dd class="text-sm font-medium text-gray-900">{{ $brand->owner->name ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Industry</dt>
                <dd class="text-sm text-gray-900">{{ $brand->industry ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Status</dt>
                <dd>
                    @if($brand->status === 'pending')
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                    @elseif($brand->status === 'approved')
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                    @else
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{{ ucfirst($brand->status) }}</span>
                    @endif
                </dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Active Members</dt>
                <dd class="text-sm text-gray-900">{{ $membersCount }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Campaigns</dt>
                <dd class="text-sm text-gray-900">{{ $brand->campaigns->count() }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Contact</dt>
                <dd class="text-sm text-gray-900">{{ $brand->contact_email ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Website</dt>
                <dd class="text-sm text-gray-900">{{ $brand->website ?? '-' }}</dd>
            </div>
        </dl>

        <div class="mt-6 space-y-2">
            @if($brand->status !== 'approved')
                <form method="POST" action="{{ route('superadmin.brands.approve', $brand) }}">
                    @csrf
                    <button type="submit" class="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600" onclick="return confirm('Approve brand ini?')">Approve</button>
                </form>
            @endif
            @if($brand->status !== 'rejected')
                <form method="POST" action="{{ route('superadmin.brands.reject', $brand) }}">
                    @csrf
                    <button type="submit" class="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600" onclick="return confirm('Reject brand ini?')">Reject</button>
                </form>
            @endif
            <form method="POST" action="{{ route('superadmin.brands.suspend', $brand) }}">
                @csrf
                <button type="submit" class="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600" onclick="return confirm('Suspend brand ini?')">Suspend</button>
            </form>
            <form method="POST" action="{{ route('superadmin.brands.destroy', $brand) }}">
                @csrf
                @method('DELETE')
                <button type="submit" class="w-full bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900" onclick="return confirm('Hapus brand ini? Data akan di-soft delete.')">Delete (Soft Delete)</button>
            </form>
        </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
        @if($brand->description)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p class="text-sm text-gray-700">{{ $brand->description }}</p>
            </div>
        @endif

        @if($brand->campaigns->count() > 0)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Campaigns ({{ $brand->campaigns->count() }})</h2>
                <div class="space-y-2">
                    @foreach($brand->campaigns->take(5) as $campaign)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $campaign->title }}</p>
                                <p class="text-xs text-gray-500">{{ ucfirst($campaign->campaign_type) }} - {{ ucfirst($campaign->status) }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        @if($brand->collaborationRequests->count() > 0)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Collaborations ({{ $brand->collaborationRequests->count() }})</h2>
                <div class="space-y-2">
                    @foreach($brand->collaborationRequests->take(5) as $collab)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $collab->title }}</p>
                                <p class="text-xs text-gray-500">To: {{ $collab->community->name ?? '-' }} - {{ ucfirst($collab->status) }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</div>
@endsection
