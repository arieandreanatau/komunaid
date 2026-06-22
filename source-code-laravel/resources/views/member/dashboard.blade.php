@extends('layouts.app')
@section('title', 'Member Dashboard')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Dashboard</h1>
    <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Komunitas Diikuti</div>
            <div class="text-3xl font-bold text-navy">{{ $joinedCommunities->count() }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Event Mendatang</div>
            <div class="text-3xl font-bold text-blue">{{ $upcomingEvents->count() }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Saldo Wallet</div>
            <div class="text-3xl font-bold text-sky-blue">Rp {{ number_format(auth()->user()->wallet->balance ?? 0, 0, ',', '.') }}</div>
        </div>
    </div>
    <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-6 border">
            <h2 class="text-lg font-bold text-navy mb-4">Komunitas Saya</h2>
            <div class="space-y-2">
                @forelse($joinedCommunities as $community)
                    <div class="p-3 bg-soft-bg rounded-lg">
                        <div class="font-medium text-sm">{{ $community->name }}</div>
                        <div class="text-xs text-gray-400">{{ $community->pivot->status }} &bull; Join: {{ $community->pivot->joined_at?->format('d M Y') ?? '-' }}</div>
                    </div>
                @empty
                    <p class="text-gray-400 text-sm">Belum join komunitas. <a href="{{ route('public.communities') }}" class="text-blue hover:underline">Jelajahi</a></p>
                @endforelse
            </div>
        </div>
        <div class="bg-white rounded-xl p-6 border">
            <h2 class="text-lg font-bold text-navy mb-4">Event Mendatang</h2>
            <div class="space-y-2">
                @forelse($upcomingEvents as $event)
                    <div class="p-3 bg-soft-bg rounded-lg">
                        <div class="font-medium text-sm">{{ $event->title }}</div>
                        <div class="text-xs text-gray-400">{{ $event->community->name }} &bull; {{ $event->start_date->format('d M Y H:i') }}</div>
                    </div>
                @empty
                    <p class="text-gray-400 text-sm">Belum ada event mendatang.</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
