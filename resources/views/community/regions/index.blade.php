@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Regional Komunitas</h1>
        <p class="text-komuna-muted">{{ $community->name }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.regions.create', $community) }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">+ Buat Regional</a>
        <a href="{{ route('community.communities.show', $community) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Kembali</a>
    </div>
</div>

@if($regions->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Nama</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Kota</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($regions as $region)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <a href="{{ route('community.regions.show', [$community, $region]) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-success">{{ $region->name }}</a>
                                @if($region->description)
                                    <p class="text-xs text-komuna-muted mt-1 truncate max-w-xs">{{ $region->description }}</p>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $region->city ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium {{ $region->status === 'active' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-text' }}">
                                    {{ ucfirst($region->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('community.regions.show', [$community, $region]) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Detail</a>
                                    <form action="{{ route('community.regions.destroy', [$community, $region]) }}" method="POST" onsubmit="return confirm('Yakin hapus regional ini?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Hapus</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $regions->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <p class="text-komuna-muted mb-4">Belum ada regional.</p>
        <a href="{{ route('community.regions.create', $community) }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Buat Regional Pertama
        </a>
    </div>
@endif
@endsection
