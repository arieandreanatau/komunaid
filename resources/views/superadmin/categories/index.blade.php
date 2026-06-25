@extends('layouts.admin')

@section('content')
<div class="flex justify-between items-center mb-8">
    <div>
        <h1 class="text-2xl font-bold text-komuna-text">Community Categories</h1>
        <p class="text-komuna-muted">Kelola kategori komunitas</p>
    </div>
    <a href="{{ route('superadmin.categories.create') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ Tambah Kategori</a>
</div>

<div class="bg-white rounded-xl shadow-sm">
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-komuna-surface">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Description</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Communities</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Active</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($categories as $category)
                    <tr>
                        <td class="px-4 py-3 text-sm font-medium text-komuna-text">{{ $category->name }}</td>
                        <td class="px-4 py-3 text-sm text-komuna-muted">{{ Str::limit($category->description, 50) ?? '-' }}</td>
                        <td class="px-4 py-3 text-sm text-komuna-muted">{{ $category->communities_count }}</td>
                        <td class="px-4 py-3">
                            @if($category->is_active)
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                            @else
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-komuna-border-soft text-komuna-text">Inactive</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex space-x-1">
                                <a href="{{ route('superadmin.categories.edit', $category) }}" class="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">Edit</a>
                                <form method="POST" action="{{ route('superadmin.categories.destroy', $category) }}">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Hapus kategori {{ $category->name }}?')">Delete</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-4 py-8 text-center text-komuna-muted">Belum ada kategori.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="p-4">
        {{ $categories->links() }}
    </div>
</div>
@endsection
