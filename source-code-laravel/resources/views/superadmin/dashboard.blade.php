@extends('layouts.app')
@section('title', 'Superadmin Dashboard')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Superadmin Dashboard</h1>

    <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Member</div>
            <div class="text-3xl font-bold text-navy">{{ $stats['total_members'] }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Komunitas</div>
            <div class="text-3xl font-bold text-blue">{{ $stats['total_communities'] }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Brand</div>
            <div class="text-3xl font-bold text-sky-blue">{{ $stats['total_brands'] }}</div>
        </div>
        <div class="bg-white rounded-xl p-6 border shadow-sm">
            <div class="text-sm text-gray-400">Total Event</div>
            <div class="text-3xl font-bold text-green-500">{{ $stats['total_events'] }}</div>
        </div>
    </div>

    <div class="grid md:grid-cols-4 gap-6 mb-8">
        <a href="{{ route('superadmin.approvals.index') }}" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:shadow-md transition">
            <div class="text-sm text-yellow-600">Pending Approvals</div>
            <div class="text-2xl font-bold text-yellow-700">
                {{ $stats['pending_communities'] + $stats['pending_brands'] + $stats['pending_events'] + $stats['pending_role_requests'] }}
            </div>
        </a>
        <div class="bg-white rounded-xl p-4 border">
            <div class="text-sm text-gray-400">Pending Komunitas</div>
            <div class="text-2xl font-bold text-orange-500">{{ $stats['pending_communities'] }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border">
            <div class="text-sm text-gray-400">Pending Brand</div>
            <div class="text-2xl font-bold text-orange-500">{{ $stats['pending_brands'] }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border">
            <div class="text-sm text-gray-400">Pending Role Request</div>
            <div class="text-2xl font-bold text-orange-500">{{ $stats['pending_role_requests'] }}</div>
        </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-6 border">
            <h2 class="text-lg font-bold text-navy mb-4">Member Terbaru</h2>
            <div class="space-y-3">
                @forelse($recentMembers as $member)
                    <div class="flex items-center gap-3 p-2 hover:bg-soft-bg rounded">
                        <div class="w-8 h-8 bg-navy rounded-full flex items-center justify-center text-white text-sm">
                            {{ substr($member->name, 0, 1) }}
                        </div>
                        <div>
                            <div class="font-medium text-sm">{{ $member->name }}</div>
                            <div class="text-xs text-gray-400">{{ $member->email }}</div>
                        </div>
                    </div>
                @empty
                    <p class="text-gray-400 text-sm">Belum ada member.</p>
                @endforelse
            </div>
        </div>

        <div class="bg-white rounded-xl p-6 border">
            <h2 class="text-lg font-bold text-navy mb-4">Quick Actions</h2>
            <div class="space-y-2">
                <a href="{{ route('superadmin.approvals.index') }}" class="block bg-yellow-50 hover:bg-yellow-100 p-3 rounded-lg text-sm font-medium text-yellow-700">
                    🔔 Approval Center
                </a>
                <a href="{{ route('superadmin.members.index') }}" class="block bg-soft-bg hover:bg-blue-50 p-3 rounded-lg text-sm font-medium text-navy">
                    👥 Kelola Member
                </a>
                <a href="{{ route('superadmin.communities.index') }}" class="block bg-soft-bg hover:bg-blue-50 p-3 rounded-lg text-sm font-medium text-navy">
                    🏠 Kelola Komunitas
                </a>
                <a href="{{ route('superadmin.brands.index') }}" class="block bg-soft-bg hover:bg-blue-50 p-3 rounded-lg text-sm font-medium text-navy">
                    🏷️ Kelola Brand
                </a>
                <a href="{{ route('superadmin.events.index') }}" class="block bg-soft-bg hover:bg-blue-50 p-3 rounded-lg text-sm font-medium text-navy">
                    🎉 Kelola Event
                </a>
                <a href="{{ route('superadmin.role-requests.index') }}" class="block bg-soft-bg hover:bg-blue-50 p-3 rounded-lg text-sm font-medium text-navy">
                    📋 Role Requests
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
