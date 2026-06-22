@extends('layouts.app')
@section('title', 'Komunitas Saya')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Komunitas Saya</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="space-y-4">
        @forelse($communities as $community)
            <div class="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                    <div class="font-bold text-navy">{{ $community->name }}</div>
                    <div class="text-sm text-gray-400">
                        Status: <span class="{{ $community->pivot->status === 'approved' ? 'text-green-600' : 'text-yellow-600' }}">{{ ucfirst($community->pivot->status) }}</span>
                        &bull; Join: {{ $community->pivot->joined_at?->format('d M Y') ?? '-' }}
                    </div>
                </div>
                <div class="flex gap-2">
                    @if($community->pivot->status === 'approved')
                        <a href="{{ route('public.community-detail', $community->slug) }}" class="text-blue text-sm hover:underline">Lihat</a>
                        <form action="{{ route('member.communities.leave', $community->id) }}" method="POST" onsubmit="return confirm('Yakin leave komunitas ini?')">
                            @csrf
                            <button class="text-red-500 text-sm hover:underline">Leave</button>
                        </form>
                    @endif
                </div>
            </div>
        @empty
            <div class="text-center py-12 text-gray-400">
                <p>Belum join komunitas manapun.</p>
                <a href="{{ route('public.communities') }}" class="text-blue hover:underline">Jelajahi Komunitas</a>
            </div>
        @endforelse
    </div>
</div>
@endsection
