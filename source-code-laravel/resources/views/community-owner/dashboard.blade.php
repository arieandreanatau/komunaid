@extends('layouts.app')
@section('title', 'Community Owner Dashboard')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Community Owner Dashboard</h1>

    <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Komunitas</div>
            <div class="text-3xl font-bold text-navy">{{ $communities->count() }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Anggota</div>
            <div class="text-3xl font-bold text-blue">{{ $totalMembers }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Event</div>
            <div class="text-3xl font-bold text-sky-blue">{{ $totalEvents }}</div>
        </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-6 border">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold text-navy">Komunitas Saya</h2>
                <a href="{{ route('community-owner.communities.create') }}" class="bg-blue hover:bg-navy text-white px-4 py-2 rounded-lg text-sm transition">
                    + Buat Komunitas
                </a>
            </div>
            <div class="space-y-3">
                @forelse($communities as $community)
                    <div class="flex items-center justify-between p-3 bg-soft-bg rounded-lg">
                        <div>
                            <div class="font-medium text-sm">{{ $community->name }}</div>
                            <div class="text-xs text-gray-400">{{ $community->members_count }} anggota &bull; {{ $community->status }}</div>
                        </div>
                        <div class="flex gap-1">
                            <a href="{{ route('community-owner.communities.members.index', $community->id) }}" class="text-blue text-xs hover:underline">Members</a>
                            <a href="{{ route('community-owner.communities.events.index', $community->id) }}" class="text-blue text-xs hover:underline ml-2">Events</a>
                        </div>
                    </div>
                @empty
                    <p class="text-gray-400 text-sm">Belum ada komunitas. <a href="{{ route('community-owner.communities.create') }}" class="text-blue hover:underline">Buat sekarang</a></p>
                @endforelse
            </div>
        </div>

        <div class="bg-white rounded-xl p-6 border">
            <h2 class="text-lg font-bold text-navy mb-4">Info</h2>
            <div class="space-y-2 text-sm">
                <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span class="text-yellow-700">📋 Pending Join: <strong>{{ $pendingJoins }}</strong></span>
                </div>
                <div class="p-3 bg-soft-bg rounded-lg">
                    <span class="text-navy">Komunitas yang belum di-approve akan menunggu review superadmin.</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
