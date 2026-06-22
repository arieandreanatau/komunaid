@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Detail Regional</h1>
    <p class="text-gray-600">{{ $community->name }} - {{ $region->name }}</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Informasi Regional</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-gray-500">Nama</p>
                    <p class="text-sm font-medium text-gray-900">{{ $region->name }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Slug</p>
                    <p class="text-sm font-medium text-gray-900">{{ $region->slug }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Kota</p>
                    <p class="text-sm font-medium text-gray-900">{{ $region->city ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Provinsi</p>
                    <p class="text-sm font-medium text-gray-900">{{ $region->province ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium {{ $region->status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                        {{ ucfirst($region->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Dibuat</p>
                    <p class="text-sm font-medium text-gray-900">{{ $region->created_at->format('d M Y') }}</p>
                </div>
            </div>

            @if($region->description)
                <div class="mt-6">
                    <p class="text-xs text-gray-500 mb-1">Deskripsi</p>
                    <p class="text-sm text-gray-900">{{ $region->description }}</p>
                </div>
            @endif
        </div>
    </div>

    <div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Anggota Regional</h3>
            @if($region->members->count() > 0)
                <div class="space-y-2">
                    @foreach($region->members->take(10) as $member)
                        <div class="flex items-center gap-2 text-sm">
                            <div class="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {{ substr($member->user->name, 0, 1) }}
                            </div>
                            <div>
                                <p class="text-gray-900 text-xs font-medium">{{ $member->user->name }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500 text-sm">Belum ada anggota.</p>
            @endif
        </div>
    </div>
</div>
@endsection
