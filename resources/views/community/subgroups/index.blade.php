@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Sub Komunitas</h1>
        <p class="text-komuna-muted">{{ $community->name }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.subgroups.create', $community) }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">+ Buat Sub Komunitas</a>
        <a href="{{ route('community.communities.show', $community) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Kembali</a>
    </div>
</div>

@if($subgroups->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Nama</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Parent</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($subgroups as $subgroup)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <p class="font-semibold text-komuna-text text-sm">{{ $subgroup->name }}</p>
                                @if($subgroup->description)
                                    <p class="text-xs text-komuna-muted mt-1 truncate max-w-xs">{{ $subgroup->description }}</p>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $subgroup->parent?->name ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium {{ $subgroup->status === 'active' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-text' }}">
                                    {{ ucfirst($subgroup->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <form action="{{ route('community.subgroups.destroy', [$community, $subgroup]) }}" method="POST" onsubmit="return confirm('Yakin hapus sub komunitas ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Hapus</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $subgroups->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <p class="text-komuna-muted mb-4">Belum ada sub komunitas.</p>
        <a href="{{ route('community.subgroups.create', $community) }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Buat Sub Komunitas Pertama
        </a>
    </div>
@endif
@endsection
