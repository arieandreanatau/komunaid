@extends('layouts.app')
@section('title', 'Direktori Komunitas')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Direktori Komunitas</h1>
    <p class="text-gray-400 mb-6">Lihat komunitas approved yang tersedia untuk kolaborasi.</p>

    @if($communities->count() > 0)
        <div class="grid md:grid-cols-3 gap-6">
            @foreach($communities as $community)
                <a href="{{ route('brand-owner.communities.show', $community) }}" class="bg-white rounded-xl border p-5 hover:shadow-md transition">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
                            @if($community->logo)
                                <img src="{{ Storage::url($community->logo) }}" alt="" class="w-full h-full object-cover">
                            @else
                                {{ substr($community->name, 0, 1) }}
                            @endif
                        </div>
                        <div>
                            <h3 class="font-semibold text-sm text-navy truncate">{{ $community->name }}</h3>
                            <p class="text-xs text-gray-400">{{ $community->category ?? '-' }}</p>
                        </div>
                    </div>
                    @if($community->description)
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ \Illuminate\Support\Str::limit($community->description, 100) }}</p>
                    @endif
                    <div class="flex items-center justify-between text-xs text-gray-400">
                        <span>{{ $community->location ?? '-' }}</span>
                        <span>{{ $community->members_count ?? 0 }} member</span>
                    </div>
                    <div class="mt-3 flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                        <button class="ml-auto bg-sky-blue text-white px-3 py-1 rounded-lg text-xs hover:opacity-90 transition"
                            onclick="event.preventDefault(); window.location.href='{{ route('brand-owner.collaborations.create') }}?community_id={{ $community->id }}'">
                            Kolaborasi
                        </button>
                    </div>
                </a>
            @endforeach
        </div>
        <div class="mt-6">{{ $communities->links() }}</div>
    @else
        <div class="bg-white rounded-xl border p-8 text-center">
            <p class="text-gray-400">Belum ada komunitas yang approved.</p>
        </div>
    @endif
</div>
@endsection
