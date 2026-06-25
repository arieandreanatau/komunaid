@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">My Registrations</h1>
        <p class="text-komuna-muted">Event yang sudah Anda daftar.</p>
    </div>
    <a href="{{ route('events.index') }}" class="bg-komuna-success-soft text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition">
        Browse Events
    </a>
</div>

@if($registrations->count() > 0)
    <div class="space-y-4">
        @foreach($registrations as $reg)
            <a href="{{ route('events.show', $reg->event) }}" class="block bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-semibold text-komuna-text">{{ $reg->event->title }}</h3>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                @if($reg->status === 'registered') bg-komuna-success-soft text-komuna-success
                                @else bg-komuna-danger-soft text-komuna-danger
                                @endif">
                                {{ ucfirst($reg->status) }}
                            </span>
                            @if($reg->payment_status)
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($reg->payment_status === 'paid') bg-komuna-success-soft text-komuna-success
                                    @elseif($reg->payment_status === 'waiting_confirmation') bg-komuna-warning-soft text-komuna-warning
                                    @elseif($reg->payment_status === 'unpaid') bg-komuna-border-soft text-komuna-text
                                    @else bg-komuna-danger-soft text-komuna-danger
                                    @endif">
                                    {{ str_replace('_', ' ', ucfirst($reg->payment_status)) }}
                                </span>
                            @endif
                        </div>
                        <p class="text-xs text-komuna-muted">{{ $reg->event->community->name }} &middot; {{ $reg->event->start_datetime->format('d M Y H:i') }}</p>
                    </div>
                    <div class="text-right">
                        @if($reg->event->isPaid())
                            <p class="text-sm font-semibold text-komuna-text">Rp {{ number_format($reg->event->price) }}</p>
                        @else
                            <p class="text-sm font-semibold text-komuna-success">Free</p>
                        @endif
                    </div>
                </div>
            </a>
        @endforeach
    </div>
    <div class="mt-6">{{ $registrations->links() }}</div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">📝</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Registrasi</h3>
        <p class="text-komuna-muted text-sm mb-4">Anda belum mendaftar di event apapun.</p>
        <a href="{{ route('events.index') }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Browse Events
        </a>
    </div>
@endif
@endsection
