@extends('layouts.app')
@section('title', 'Detail Brand')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.brands.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-navy">{{ $brand->name }}</h1>
        <div class="flex items-center gap-2">
            <a href="{{ route('brand-owner.brands.edit', $brand) }}" class="bg-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-navy transition">Edit</a>
            <a href="{{ route('brand-owner.staff.index', $brand) }}" class="bg-sky-blue text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">Staff</a>
        </div>
    </div>

    @if($brand->banner)
        <div class="rounded-xl overflow-hidden h-48 mb-6">
            <img src="{{ Storage::url($brand->banner) }}" alt="Banner" class="w-full h-full object-cover">
        </div>
    @endif

    <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-6">
            <div class="bg-white rounded-xl border p-6">
                <h2 class="text-lg font-bold text-navy mb-4">Informasi Brand</h2>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-400 text-xs">Status</p>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium
                            @if($brand->status === 'approved') bg-green-100 text-green-800
                            @elseif($brand->status === 'pending') bg-yellow-100 text-yellow-800
                            @else bg-red-100 text-red-800
                            @endif">{{ ucfirst($brand->status) }}</span>
                    </div>
                    <div><p class="text-gray-400 text-xs">Industri</p><p class="font-medium">{{ $brand->industry ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Slug</p><p class="font-medium">{{ $brand->slug }}</p></div>
                    <div><p class="text-gray-400 text-xs">Website</p><p class="font-medium">{{ $brand->website ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Instagram</p><p class="font-medium">{{ $brand->instagram ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Contact Person</p><p class="font-medium">{{ $brand->contact_person ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Contact Email</p><p class="font-medium">{{ $brand->contact_email ?? '-' }}</p></div>
                    <div><p class="text-gray-400 text-xs">Contact Phone</p><p class="font-medium">{{ $brand->contact_phone ?? '-' }}</p></div>
                </div>
                @if($brand->description)
                    <div class="mt-4">
                        <p class="text-gray-400 text-xs mb-1">Deskripsi</p>
                        <p class="text-sm">{{ $brand->description }}</p>
                    </div>
                @endif
            </div>

            @if($brand->campaigns->count() > 0)
                <div class="bg-white rounded-xl border p-6">
                    <h2 class="text-lg font-bold text-navy mb-4">Campaign</h2>
                    <div class="space-y-2">
                        @foreach($brand->campaigns->take(5) as $campaign)
                            <a href="{{ route('brand-owner.campaigns.show', $campaign) }}" class="block p-3 bg-soft-bg rounded-lg hover:shadow-sm transition">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="font-medium text-sm">{{ $campaign->title }}</p>
                                        <p class="text-xs text-gray-400">{{ $campaign->start_date?->format('d M Y') ?? '-' }}</p>
                                    </div>
                                    <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                        @if($campaign->status === 'active') bg-green-100 text-green-800
                                        @elseif($campaign->status === 'draft') bg-gray-100 text-gray-800
                                        @else bg-yellow-100 text-yellow-800
                                        @endif">{{ ucfirst($campaign->status) }}</span>
                                </div>
                            </a>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        <div class="space-y-6">
            <div class="bg-white rounded-xl border p-5">
                <h3 class="font-bold text-navy mb-3">Statistik</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">Staff</span><span class="font-medium">{{ $stats['total_staff'] }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Campaign</span><span class="font-medium">{{ $stats['total_campaigns'] }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Active Campaign</span><span class="font-medium">{{ $stats['active_campaigns'] }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Kolaborasi</span><span class="font-medium">{{ $stats['total_collaborations'] }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Pending Kolaborasi</span><span class="font-medium">{{ $stats['pending_collaborations'] }}</span></div>
                </div>
            </div>

            <div class="bg-white rounded-xl border p-5">
                <h3 class="font-bold text-navy mb-3">Staff</h3>
                @if($brand->activeMembers->count() > 0)
                    <div class="space-y-2">
                        @foreach($brand->activeMembers->take(5) as $member)
                            <div class="flex items-center justify-between text-sm">
                                <span>{{ $member->user->name }}</span>
                                <span class="text-xs text-gray-400">{{ $member->role }}</span>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-gray-400 text-sm">Belum ada staff.</p>
                @endif
                <a href="{{ route('brand-owner.staff.index', $brand) }}" class="block text-center text-blue text-sm font-medium mt-3 hover:underline">Kelola Staff</a>
            </div>

            <div class="bg-white rounded-xl border p-5">
                <h3 class="font-bold text-navy mb-3">Aksi</h3>
                <div class="space-y-2">
                    <a href="{{ route('brand-owner.campaigns.create') }}" class="block w-full text-center bg-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-navy transition">Buat Campaign</a>
                    <a href="{{ route('brand-owner.collaborations.create') }}" class="block w-full text-center bg-sky-blue text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">Ajukan Kolaborasi</a>
                    <form action="{{ route('brand-owner.brands.destroy', $brand) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus brand ini?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="block w-full text-center bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition">Hapus Brand</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
