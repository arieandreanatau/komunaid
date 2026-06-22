@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Brand Management</h1>
    <p class="text-gray-600">Kelola semua brand di platform</p>
</div>

<div class="bg-white rounded-xl shadow-sm p-6 mb-6">
    <form method="GET" action="{{ route('superadmin.brands.index') }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nama brand atau industri..."
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
        </div>
        <div class="min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Semua Status</option>
                <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="approved" {{ request('status') === 'approved' ? 'selected' : '' }}>Approved</option>
                <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Rejected</option>
            </select>
        </div>
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Filter</button>
        <a href="{{ route('superadmin.brands.index') }}" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">Reset</a>
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($brands as $brand)
                    <tr>
                        <td class="px-4 py-3 text-sm font-medium text-gray-900">
                            <a href="{{ route('superadmin.brands.show', $brand) }}" class="hover:text-emerald-600">{{ $brand->name }}</a>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ $brand->owner->name ?? '-' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ $brand->industry ?? '-' }}</td>
                        <td class="px-4 py-3">
                            @if($brand->status === 'pending')
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                            @elseif($brand->status === 'approved')
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                            @else
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{{ ucfirst($brand->status) }}</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex space-x-1">
                                <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-emerald-600 hover:text-emerald-800 text-xs px-2 py-1">Detail</a>
                                @if($brand->status === 'pending')
                                    <form method="POST" action="{{ route('superadmin.brands.approve', $brand) }}">
                                        @csrf
                                        <button type="submit" class="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Approve brand ini?')">Approve</button>
                                    </form>
                                    <form method="POST" action="{{ route('superadmin.brands.reject', $brand) }}">
                                        @csrf
                                        <button type="submit" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Reject brand ini?')">Reject</button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-4 py-8 text-center text-gray-500">Tidak ada brand ditemukan.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="p-4">
        {{ $brands->withQueryString()->links() }}
    </div>
</div>
@endsection
