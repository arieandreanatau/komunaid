@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ $event->title }}</h1>
        <p class="text-gray-600">{{ $event->community->name }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.events.edit', $event) }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Edit</a>
        <a href="{{ route('community.events.registrations', $event) }}" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Registrasi</a>
        <a href="{{ route('community.events.galleries.index', $event) }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Gallery</a>
        <a href="{{ route('community.events.chats.index', $event) }}" class="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">Chat</a>
        <form action="{{ route('community.events.destroy', $event) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus event ini?')">
            @csrf
            @method('DELETE')
            <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Hapus</button>
        </form>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Detail Event</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-gray-500">Tipe Event</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($event->event_type === 'paid') bg-purple-100 text-purple-800
                        @elseif($event->event_type === 'free') bg-green-100 text-green-800
                        @else bg-blue-100 text-blue-800
                        @endif">
                        {{ ucfirst($event->event_type) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Status Approval</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($event->approval_status === 'approved') bg-green-100 text-green-800
                        @elseif($event->approval_status === 'pending') bg-yellow-100 text-yellow-800
                        @else bg-red-100 text-red-800
                        @endif">
                        {{ ucfirst($event->approval_status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Lokasi</p>
                    <p class="text-sm font-medium text-gray-900">{{ ucfirst($event->location_type) }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Alamat</p>
                    <p class="text-sm font-medium text-gray-900">{{ $event->location_address ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Tanggal Mulai</p>
                    <p class="text-sm font-medium text-gray-900">{{ $event->start_datetime->format('d M Y H:i') }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Tanggal Selesai</p>
                    <p class="text-sm font-medium text-gray-900">{{ $event->end_datetime->format('d M Y H:i') }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Kapasitas</p>
                    <p class="text-sm font-medium text-gray-900">{{ $event->capacity ?? 'Unlimited' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Registrasi</p>
                    <p class="text-sm font-medium text-gray-900">{{ ucfirst($event->registration_status) }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Visibilitas</p>
                    <p class="text-sm font-medium text-gray-900">{{ ucfirst($event->visibility) }}</p>
                </div>
                @if($event->isPaid())
                    <div>
                        <p class="text-xs text-gray-500">Harga</p>
                        <p class="text-sm font-medium text-gray-900">Rp {{ number_format($event->price) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Platform Fee</p>
                        <p class="text-sm font-medium text-gray-900">Rp {{ number_format($event->platform_fee) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Admin Fee</p>
                        <p class="text-sm font-medium text-gray-900">Rp {{ number_format($event->admin_fee) }}</p>
                    </div>
                @endif
                @if($event->eo_by_platform)
                    <div>
                        <p class="text-xs text-gray-500">EO Fee</p>
                        <p class="text-sm font-medium text-gray-900">Rp {{ number_format($event->eo_fee) }}</p>
                    </div>
                @endif
            </div>

            @if($event->description)
                <div class="mt-6">
                    <p class="text-xs text-gray-500 mb-1">Deskripsi</p>
                    <p class="text-sm text-gray-900">{{ $event->description }}</p>
                </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Statistik</h3>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Total Registrasi</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_registrations'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Sudah Bayar</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_paid'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Menunggu Bayar</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_waiting'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Gallery</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_gallery'] }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Chat Threads</span>
                    <span class="font-medium text-gray-900">{{ $stats['total_chats'] }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
