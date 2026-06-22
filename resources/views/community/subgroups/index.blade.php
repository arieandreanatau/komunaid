@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Sub Komunitas</h1>
        <p class="text-gray-600">{{ $community->name }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.subgroups.create', $community) }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">+ Buat Sub Komunitas</a>
        <a href="{{ route('community.communities.show', $community) }}" class="text-gray-600 text-sm hover:text-gray-800">Kembali</a>
    </div>
</div>

@if($subgroups->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($subgroups as $subgroup)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <p class="font-semibold text-gray-900 text-sm">{{ $subgroup->name }}</p>
                                @if($subgroup->description)
                                    <p class="text-xs text-gray-500 mt-1 truncate max-w-xs">{{ $subgroup->description }}</p>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $subgroup->parent?->name ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium {{ $subgroup->status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                                    {{ ucfirst($subgroup->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <form action="{{ route('community.subgroups.destroy', [$community, $subgroup]) }}" method="POST" onsubmit="return confirm('Yakin hapus sub komunitas ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
            {{ $subgroups->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p class="text-gray-500 mb-4">Belum ada sub komunitas.</p>
        <a href="{{ route('community.subgroups.create', $community) }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Buat Sub Komunitas Pertama
        </a>
    </div>
@endif
@endsection
