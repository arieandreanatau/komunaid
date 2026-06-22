@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Brand Owner</h1>
    <p class="text-gray-600">Selamat datang, {{ $user->name }}!</p>
</div>

<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg">🏷</div>
            <div>
                <p class="text-xs text-gray-500">Brand</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['total_brands'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 font-bold text-lg">⏳</div>
            <div>
                <p class="text-xs text-gray-500">Pending</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['pending_brands'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-lg">✓</div>
            <div>
                <p class="text-xs text-gray-500">Approved</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['approved_brands'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-lg">📢</div>
            <div>
                <p class="text-xs text-gray-500">Campaign</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['total_campaigns'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">🔥</div>
            <div>
                <p class="text-xs text-gray-500">Active Campaign</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['active_campaigns'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-lg">🤝</div>
            <div>
                <p class="text-xs text-gray-500">Kolaborasi</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['total_collaborations'] }}</p>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Brand Saya</h2>
            <a href="{{ route('brand.brands.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                + Buat Brand
            </a>
        </div>

        @if(isset($ownedBrands) && $ownedBrands->count() > 0)
            <div class="space-y-3">
                @foreach($ownedBrands as $brand)
                    <a href="{{ route('brand.brands.show', $brand) }}" class="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                @if($brand->logo)
                                    <img src="{{ Storage::url($brand->logo) }}" alt="" class="w-full h-full object-cover">
                                @else
                                    {{ substr($brand->name, 0, 1) }}
                                @endif
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-gray-900 text-sm truncate">{{ $brand->name }}</h3>
                                    <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                        @if($brand->status === 'approved') bg-green-100 text-green-800
                                        @elseif($brand->status === 'pending') bg-yellow-100 text-yellow-800
                                        @elseif($brand->status === 'rejected') bg-red-100 text-red-800
                                        @else bg-gray-100 text-gray-800
                                        @endif">
                                        {{ ucfirst($brand->status) }}
                                    </span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">{{ $brand->industry ?? '-' }} &middot; {{ $brand->activeMembers->count() }} staff</p>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        @else
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div class="text-4xl mb-3">🏷</div>
                <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Brand</h3>
                <p class="text-gray-500 text-sm mb-4">Buat brand pertama Anda.</p>
                <a href="{{ route('brand.brands.create') }}" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                    Buat Brand
                </a>
            </div>
        @endif
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Akun</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Nama</span>
                    <span class="font-medium text-gray-900">{{ $user->name }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Role</span>
                    <span class="font-medium text-gray-900">Brand Owner</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Username</span>
                    <span class="font-medium text-gray-900">{{ $user->profile?->username ?? '-' }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-2">Ringkasan</h3>
            <p class="text-gray-500 text-sm mb-3">Aktivitas brand Anda.</p>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Pending Collaborations</span>
                    <span class="font-medium text-gray-900">{{ $stats['pending_collaborations'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Active Campaigns</span>
                    <span class="font-medium text-gray-900">{{ $stats['active_campaigns'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Total Collaborations</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_collaborations'] }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
