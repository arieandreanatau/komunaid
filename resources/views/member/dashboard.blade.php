@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-600">Selamat datang, {{ $user->name }}!</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">🏘️</div>
            <div>
                <p class="text-xs text-gray-500">Komunitas Diikuti</p>
                <p class="text-2xl font-bold text-gray-900">{{ $memberCount }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">📅</div>
            <div>
                <p class="text-xs text-gray-500">Event Diikuti</p>
                <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">👥</div>
            <div>
                <p class="text-xs text-gray-500">Teman</p>
                <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 font-bold">💰</div>
            <div>
                <p class="text-xs text-gray-500">Wallet</p>
                <p class="text-2xl font-bold text-gray-900">Rp 0</p>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Komunitas Saya</h2>
            <a href="{{ route('communities.directory') }}" class="text-emerald-600 text-sm font-medium hover:underline">Lihat Semua</a>
        </div>

        @if($joinedCommunities->count() > 0)
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @foreach($joinedCommunities as $community)
                    <a href="{{ route('communities.detail', $community->slug) }}" class="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                @if($community->logo)
                                    <img src="{{ $community->logo }}" alt="" class="w-full h-full object-cover">
                                @else
                                    {{ substr($community->name, 0, 1) }}
                                @endif
                            </div>
                            <div class="min-w-0">
                                <h3 class="font-semibold text-gray-900 text-sm truncate">{{ $community->name }}</h3>
                                <p class="text-xs text-gray-500">{{ $community->category->icon }} {{ $community->category->name }}</p>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        @else
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div class="text-4xl mb-3">🏘️</div>
                <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Komunitas</h3>
                <p class="text-gray-500 text-sm mb-4">Anda belum bergabung dengan komunitas manapun.</p>
                <a href="{{ route('communities.directory') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                    Jelajahi Komunitas
                </a>
            </div>
        @endif
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Profil</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Role</span>
                    <span class="font-medium text-gray-900">{{ ucfirst(str_replace('_', ' ', auth()->user()->getRoleNames()->first() ?? 'member')) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Username</span>
                    <span class="font-medium text-gray-900">{{ $user->profile?->username ?? '-' }}</span>
                </div>
            </div>
            <div class="mt-4 space-y-2">
                <a href="{{ route('member.profile.edit') }}" class="block text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                    Edit Profile
                </a>
                <a href="{{ route('member.role-request.index') }}" class="block text-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition">
                    Role Request
                </a>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-2">Event</h3>
            <p class="text-gray-500 text-sm mb-3">Event yang Anda ikuti akan muncul di sini.</p>
            <div class="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
                Coming soon
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-2">Wallet</h3>
            <p class="text-gray-500 text-sm mb-3">Saldo dan transaksi Anda.</p>
            <div class="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
                Coming soon
            </div>
        </div>
    </div>
</div>
@endsection
