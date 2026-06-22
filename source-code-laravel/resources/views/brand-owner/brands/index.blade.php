@extends('layouts.app')
@section('title', 'Brand Saya')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-navy">Brand Saya</h1>
        <a href="{{ route('brand-owner.brands.create') }}" class="bg-blue hover:bg-navy text-white px-4 py-2 rounded-lg text-sm transition">+ Buat Brand</a>
    </div>

    @if($brands->count() > 0)
        <div class="bg-white rounded-xl border overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industri</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($brands as $brand)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <a href="{{ route('brand-owner.brands.show', $brand) }}" class="font-semibold text-sm text-navy hover:underline">{{ $brand->name }}</a>
                                <p class="text-xs text-gray-400">{{ $brand->slug }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $brand->industry ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($brand->status === 'approved') bg-green-100 text-green-800
                                    @elseif($brand->status === 'pending') bg-yellow-100 text-yellow-800
                                    @else bg-red-100 text-red-800
                                    @endif">
                                    {{ ucfirst($brand->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $brand->active_members_count ?? 0 }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('brand-owner.brands.show', $brand) }}" class="text-blue text-sm hover:underline">Detail</a>
                                    <a href="{{ route('brand-owner.brands.edit', $brand) }}" class="text-blue text-sm hover:underline">Edit</a>
                                    <a href="{{ route('brand-owner.staff.index', $brand) }}" class="text-blue text-sm hover:underline">Staff</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $brands->links() }}</div>
    @else
        <div class="bg-white rounded-xl border p-8 text-center">
            <p class="text-gray-400 mb-4">Belum ada brand.</p>
            <a href="{{ route('brand-owner.brands.create') }}" class="bg-blue hover:bg-navy text-white px-5 py-2 rounded-lg text-sm transition">Buat Brand</a>
        </div>
    @endif
</div>
@endsection
