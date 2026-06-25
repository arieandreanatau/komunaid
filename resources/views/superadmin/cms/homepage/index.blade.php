@extends('layouts.admin')

@section('content')
<div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-bold text-komuna-text">Homepage Sections</h2>
    <a href="{{ route('superadmin.cms.homepage.create') }}" class="bg-komuna-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy transition">
        + Tambah Section
    </a>
</div>

@if($sections->isNotEmpty())
    <div class="bg-white rounded-2xl border border-komuna-border-soft overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-komuna-surface border-b border-komuna-border-soft">
                <tr>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Key</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Title</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Sort</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Status</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                @foreach($sections as $section)
                    <tr class="hover:bg-komuna-surface">
                        <td class="px-4 py-3 font-mono text-xs text-komuna-blue">{{ $section->key }}</td>
                        <td class="px-4 py-3 text-komuna-text">{{ $section->title ?? '-' }}</td>
                        <td class="px-4 py-3 text-komuna-muted">{{ $section->sort_order ?? '-' }}</td>
                        <td class="px-4 py-3">
                            <span class="text-xs px-2 py-0.5 rounded-full {{ $section->is_active ? 'bg-green-100 text-green-700' : 'bg-komuna-border-soft text-komuna-muted' }}">
                                {{ $section->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <a href="{{ route('superadmin.cms.homepage.edit', $section) }}" class="text-komuna-blue hover:underline text-xs">Edit</a>
                                <form action="{{ route('superadmin.cms.homepage.destroy', $section) }}" method="POST" onsubmit="return confirm('Yakin hapus section ini?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="text-red-500 hover:underline text-xs">Hapus</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@else
    <div class="bg-white rounded-2xl border border-komuna-border-soft p-8 text-center">
        <p class="text-komuna-muted">Belum ada homepage section.</p>
        <a href="{{ route('superadmin.cms.homepage.create') }}" class="inline-block mt-3 text-komuna-blue text-sm font-semibold hover:underline">+ Tambah Section</a>
    </div>
@endif
@endsection
