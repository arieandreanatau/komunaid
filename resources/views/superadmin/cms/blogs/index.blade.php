@extends('layouts.admin')

@section('content')
<div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-bold text-komuna-text">Blog</h2>
    <a href="{{ route('superadmin.cms.blogs.create') }}" class="bg-komuna-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy transition">+ Tambah Blog</a>
</div>

<form action="{{ route('superadmin.cms.blogs.index') }}" method="GET" class="flex gap-2 mb-6">
    <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari blog..." class="flex-1 rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
    <select name="status" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
        <option value="">Semua Status</option>
        <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
        <option value="published" {{ request('status') === 'published' ? 'selected' : '' }}>Published</option>
        <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Archived</option>
    </select>
    <button type="submit" class="bg-komuna-blue text-white px-4 py-2 rounded-xl text-sm hover:bg-komuna-navy transition">Filter</button>
</form>

@if($blogs->isNotEmpty())
    <div class="bg-white rounded-2xl border border-komuna-border-soft overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-komuna-surface border-b border-komuna-border-soft">
                <tr>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Judul</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Kategori</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Status</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Tanggal</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                @foreach($blogs as $blog)
                    <tr class="hover:bg-komuna-surface">
                        <td class="px-4 py-3 text-komuna-text font-medium">{{ Str::limit($blog->title, 40) }}</td>
                        <td class="px-4 py-3 text-komuna-muted text-xs">{{ $blog->category ?? '-' }}</td>
                        <td class="px-4 py-3">
                            @php
                                $statusColors = ['draft' => 'bg-yellow-100 text-yellow-700', 'published' => 'bg-green-100 text-green-700', 'archived' => 'bg-komuna-border-soft text-komuna-muted'];
                            @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full {{ $statusColors[$blog->status] ?? 'bg-komuna-border-soft' }}">{{ $blog->status }}</span>
                        </td>
                        <td class="px-4 py-3 text-komuna-light-text text-xs">{{ $blog->created_at->format('d M Y') }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2 text-xs">
                                <a href="{{ route('superadmin.cms.blogs.edit', $blog) }}" class="text-komuna-blue hover:underline">Edit</a>
                                @if($blog->status !== 'published')
                                    <form action="{{ route('superadmin.cms.blogs.publish', $blog) }}" method="POST">@csrf <button type="submit" class="text-green-600 hover:underline">Publish</button></form>
                                @endif
                                @if($blog->status !== 'archived')
                                    <form action="{{ route('superadmin.cms.blogs.archive', $blog) }}" method="POST">@csrf <button type="submit" class="text-yellow-600 hover:underline">Archive</button></form>
                                @endif
                                <form action="{{ route('superadmin.cms.blogs.destroy', $blog) }}" method="POST" onsubmit="return confirm('Yakin?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="text-red-500 hover:underline">Hapus</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $blogs->links() }}</div>
@else
    <div class="bg-white rounded-2xl border border-komuna-border-soft p-8 text-center">
        <p class="text-komuna-muted">Belum ada blog.</p>
    </div>
@endif
@endsection
