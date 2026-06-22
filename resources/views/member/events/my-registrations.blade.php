@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">My Registrations</h1>
        <p class="text-gray-600">Event yang sudah Anda daftar.</p>
    </div>
    <a href="{{ route('events.index') }}" class="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition">
        Browse Events
    </a>
</div>

@if($registrations->count() > 0)
    <div class="space-y-4">
        @foreach($registrations as $reg)
            <a href="{{ route('events.show', $reg->event) }}" class="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-semibold text-gray-900">{{ $reg->event->title }}</h3>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                @if($reg->status === 'registered') bg-green-100 text-green-800
                                @else bg-red-100 text-red-800
                                @endif">
                                {{ ucfirst($reg->status) }}
                            </span>
                            @if($reg->payment_status)
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($reg->payment_status === 'paid') bg-green-100 text-green-800
                                    @elseif($reg->payment_status === 'waiting_confirmation') bg-yellow-100 text-yellow-800
                                    @elseif($reg->payment_status === 'unpaid') bg-gray-100 text-gray-800
                                    @else bg-red-100 text-red-800
                                    @endif">
                                    {{ str_replace('_', ' ', ucfirst($reg->payment_status)) }}
                                </span>
                            @endif
                        </div>
                        <p class="text-xs text-gray-500">{{ $reg->event->community->name }} &middot; {{ $reg->event->start_datetime->format('d M Y H:i') }}</p>
                    </div>
                    <div class="text-right">
                        @if($reg->event->isPaid())
                            <p class="text-sm font-semibold text-gray-900">Rp {{ number_format($reg->event->price) }}</p>
                        @else
                            <p class="text-sm font-semibold text-emerald-600">Free</p>
                        @endif
                    </div>
                </div>
            </a>
        @endforeach
    </div>
    <div class="mt-6">{{ $registrations->links() }}</div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">📝</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Registrasi</h3>
        <p class="text-gray-500 text-sm mb-4">Anda belum mendaftar di event apapun.</p>
        <a href="{{ route('events.index') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Browse Events
        </a>
    </div>
@endif
@endsection
