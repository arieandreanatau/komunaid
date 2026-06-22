@extends('layouts.app')
@section('title', 'Kolaborasi Saya')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-navy">Collaboration Requests</h1>
        <a href="{{ route('brand-owner.collaborations.create') }}" class="bg-sky-blue hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm transition">+ Ajukan Kolaborasi</a>
    </div>

    @if($collaborations->count() > 0)
        <div class="space-y-3">
            @foreach($collaborations as $collab)
                <a href="{{ route('brand-owner.collaborations.show', $collab) }}" class="block bg-white rounded-xl border p-4 hover:shadow-sm transition">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium text-sm">{{ $collab->title }}</div>
                            <div class="text-xs text-gray-400 mt-1">{{ $collab->brand->name }} &rarr; {{ $collab->community->name }}</div>
                            <div class="text-xs text-gray-400 mt-1">{{ ucfirst(str_replace('_', ' ', $collab->type)) }}</div>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium
                            @if($collab->status === 'approved') bg-green-100 text-green-800
                            @elseif($collab->status === 'pending') bg-yellow-100 text-yellow-800
                            @elseif($collab->status === 'rejected') bg-red-100 text-red-800
                            @else bg-gray-100 text-gray-800
                            @endif">{{ ucfirst($collab->status) }}</span>
                    </div>
                </a>
            @endforeach
        </div>
        <div class="mt-4">{{ $collaborations->links() }}</div>
    @else
        <div class="bg-white rounded-xl border p-8 text-center">
            <p class="text-gray-400 mb-4">Belum ada collaboration request.</p>
            <a href="{{ route('brand-owner.collaborations.create') }}" class="bg-sky-blue hover:opacity-90 text-white px-5 py-2 rounded-lg text-sm transition">Ajukan Kolaborasi</a>
        </div>
    @endif
</div>
@endsection
