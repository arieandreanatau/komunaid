@extends('layouts.admin')

@section('content')
<h2 class="text-xl font-bold text-komuna-text mb-6">CMS Pages</h2>

@if($pages->isNotEmpty())
    <div class="bg-white rounded-2xl border border-komuna-border-soft overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-komuna-surface border-b border-komuna-border-soft">
                <tr>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Key</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Judul</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Status</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Bahasa</th>
                    <th class="text-left px-4 py-3 font-medium text-komuna-muted">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                @foreach($pages as $page)
                    <tr class="hover:bg-komuna-surface">
                        <td class="px-4 py-3 font-mono text-xs text-komuna-blue">{{ $page->key }}</td>
                        <td class="px-4 py-3 text-komuna-text">{{ $page->title }}</td>
                        <td class="px-4 py-3">
                            @php
                                $statusColors = ['draft' => 'bg-yellow-100 text-yellow-700', 'published' => 'bg-green-100 text-green-700', 'archived' => 'bg-komuna-border-soft text-komuna-muted'];
                                $status = $page->status ?? ($page->is_published ? 'published' : 'draft');
                            @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full {{ $statusColors[$status] ?? 'bg-komuna-border-soft' }}">{{ $status }}</span>
                        </td>
                        <td class="px-4 py-3 text-komuna-muted text-xs">{{ $page->language_code ?? 'id' }}</td>
                        <td class="px-4 py-3">
                            <a href="{{ route('superadmin.cms.pages.edit', $page) }}" class="text-komuna-blue hover:underline text-xs">Edit</a>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@else
    <div class="bg-white rounded-2xl border border-komuna-border-soft p-8 text-center">
        <p class="text-komuna-muted">Belum ada CMS pages. Jalankan seeder untuk membuat halaman default.</p>
    </div>
@endif
@endsection
