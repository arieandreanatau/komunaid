@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Brand Saya</h1>
        <p class="text-komuna-muted">Kelola semua brand yang Anda miliki.</p>
    </div>
    <a href="{{ route('brand.brands.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        + Buat Brand
    </a>
</div>

@if($brands->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Industri</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Staff</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($brands as $brand)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                                        @if($brand->logo)
                                            <img src="{{ Storage::url($brand->logo) }}" alt="" class="w-full h-full object-cover">
                                        @else
                                            {{ substr($brand->name, 0, 1) }}
                                        @endif
                                    </div>
                                    <div>
                                        <a href="{{ route('brand.brands.show', $brand) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-blue">{{ $brand->name }}</a>
                                        <p class="text-xs text-komuna-muted">{{ $brand->slug }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $brand->industry ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($brand->status === 'approved') bg-komuna-success-soft text-komuna-success
                                    @elseif($brand->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                    @elseif($brand->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                    @else bg-komuna-border-soft text-komuna-text
                                    @endif">
                                    {{ ucfirst($brand->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $brand->activeMembers->count() }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('brand.brands.show', $brand) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a>
                                    <a href="{{ route('brand.brands.edit', $brand) }}" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Edit</a>
                                    <a href="{{ route('brand.staff.index', $brand) }}" class="text-komuna-info hover:text-komuna-info text-sm font-medium">Staff</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $brands->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">🏷</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Brand</h3>
        <p class="text-komuna-muted text-sm mb-4">Buat brand pertama Anda.</p>
        <a href="{{ route('brand.brands.create') }}" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Buat Brand
        </a>
    </div>
@endif
@endsection
