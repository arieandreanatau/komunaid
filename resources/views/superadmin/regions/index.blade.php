@extends('layouts.admin')

@section('content')
<div class="flex justify-between items-center mb-8">
    <div>
        <h1 class="text-2xl font-bold text-komuna-text">Master Regions</h1>
        <p class="text-komuna-muted">Kelola data region/wilayah</p>
    </div>
    <a href="{{ route('superadmin.regions.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ Tambah Region</a>
</div>

<div class="bg-white rounded-xl shadow-sm p-6 mb-6">
    <form method="GET" action="{{ route('superadmin.regions.index') }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-komuna-text mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nama region atau provinsi..."
                   class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm focus:ring-komuna-blue focus:border-komuna-blue">
        </div>
        <div class="min-w-[150px]">
            <label class="block text-sm font-medium text-komuna-text mb-1">Province</label>
            <select name="province" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm focus:ring-komuna-blue focus:border-komuna-blue">
                <option value="">Semua Provinsi</option>
                @foreach($provinces as $province)
                    <option value="{{ $province }}" {{ request('province') === $province ? 'selected' : '' }}>{{ $province }}</option>
                @endforeach
            </select>
        </div>
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Filter</button>
        <a href="{{ route('superadmin.regions.index') }}" class="bg-komuna-border text-komuna-text px-4 py-2 rounded-lg text-sm hover:bg-komuna-border">Reset</a>
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-komuna-surface">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Code</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Province</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Active</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($regions as $region)
                    <tr>
                        <td class="px-4 py-3 text-sm font-medium text-komuna-text">{{ $region->name }}</td>
                        <td class="px-4 py-3 text-sm text-komuna-muted">{{ $region->code ?? '-' }}</td>
                        <td class="px-4 py-3 text-sm text-komuna-muted">{{ $region->province ?? '-' }}</td>
                        <td class="px-4 py-3">
                            @if($region->is_active)
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                            @else
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-komuna-border-soft text-komuna-text">Inactive</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex space-x-1">
                                <a href="{{ route('superadmin.regions.edit', $region) }}" class="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">Edit</a>
                                <form method="POST" action="{{ route('superadmin.regions.destroy', $region) }}">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Hapus region {{ $region->name }}?')">Delete</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-4 py-8 text-center text-komuna-muted">Belum ada region.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="p-4">
        {{ $regions->withQueryString()->links() }}
    </div>
</div>
@endsection
