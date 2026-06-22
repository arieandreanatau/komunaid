@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Direktori Komunitas</h1>
    <p class="text-gray-600">Lihat komunitas approved yang tersedia untuk kolaborasi.</p>
</div>

@if($communities->count() > 0)
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($communities as $community)
            <a href="{{ route('brand.community-directory.show', $community) }}" class="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                        @if($community->logo)
                            <img src="{{ Storage::url($community->logo) }}" alt="" class="w-full h-full object-cover">
                        @else
                            {{ substr($community->name, 0, 1) }}
                        @endif
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-semibold text-gray-900 text-sm truncate">{{ $community->name }}</h3>
                        <p class="text-xs text-gray-500">{{ $community->category->name ?? '-' }}</p>
                    </div>
                </div>
                @if($community->description)
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ Str::limit($community->description, 100) }}</p>
                @endif
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>{{ $community->city ?? '-' }}{{ $community->region ? ', ' . $community->region : '' }}</span>
                    <span>{{ $community->activeMembers->count() }} member</span>
                </div>
                <div class="mt-3 flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Approved</span>
                    <button class="ml-auto bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
                        onclick="event.preventDefault(); window.location.href='{{ route('brand.collaborations.create') }}?community_id={{ $community->id }}'">
                        Ajukan Kolaborasi
                    </button>
                </div>
            </a>
        @endforeach
    </div>
    <div class="mt-6">
        {{ $communities->links() }}
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">🏘</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Komunitas</h3>
        <p class="text-gray-500 text-sm">Belum ada komunitas yang approved.</p>
    </div>
@endif
@endsection
