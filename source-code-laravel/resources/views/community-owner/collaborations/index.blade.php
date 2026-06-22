@extends('layouts.app')
@section('title', 'Kolaborasi - ' . $community->name)
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <a href="{{ route('community-owner.communities.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Kolaborasi: {{ $community->name }}</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="space-y-4">
        @forelse($collaborations as $collab)
            <div class="bg-white rounded-xl border p-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-navy">{{ $collab->title }}</h3>
                        <p class="text-sm text-gray-500">Brand: {{ $collab->brand->name }} &bull; Tipe: {{ $collab->type }}</p>
                        <p class="text-sm text-gray-600 mt-1">{{ $collab->description }}</p>
                        <span class="text-xs {{ $collab->status === 'approved' ? 'bg-green-100 text-green-700' : ($collab->status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') }} px-2 py-1 rounded mt-2 inline-block">
                            {{ ucfirst($collab->status) }}
                        </span>
                    </div>
                    @if($collab->status === 'pending')
                        <div class="flex gap-1">
                            <form action="{{ route('community-owner.collaborations.approve', $collab->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                            </form>
                            <form action="{{ route('community-owner.collaborations.reject', $collab->id) }}" method="POST">
                                @csrf @method('PUT')
                                <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                            </form>
                        </div>
                    @endif
                </div>
            </div>
        @empty
            <div class="text-center py-8 text-gray-400">Belum ada kolaborasi.</div>
        @endforelse
    </div>
</div>
@endsection
