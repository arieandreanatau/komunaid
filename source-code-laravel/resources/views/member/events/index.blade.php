@extends('layouts.app')
@section('title', 'Event Saya')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Event Saya</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    <div class="space-y-4">
        @forelse($registrations as $reg)
            <div class="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                    <div class="font-bold text-navy">{{ $reg->event->title }}</div>
                    <div class="text-sm text-gray-400">{{ $reg->event->community->name }} &bull; {{ $reg->event->start_date->format('d M Y H:i') }}</div>
                    <div class="text-sm mt-1">
                        <span class="{{ $reg->status === 'registered' ? 'text-green-600' : ($reg->status === 'attended' ? 'text-blue-600' : 'text-red-600') }}">
                            {{ ucfirst($reg->status) }}
                        </span>
                        &bull; {{ ucfirst($reg->payment_status) }}
                    </div>
                </div>
                @if($reg->status === 'registered')
                    <form action="{{ route('member.events.cancel', $reg->event->id) }}" method="POST" onsubmit="return confirm('Batalkan pendaftaran?')">
                        @csrf
                        <button class="text-red-500 text-sm hover:underline">Batal</button>
                    </form>
                @endif
            </div>
        @empty
            <div class="text-center py-12 text-gray-400">Belum ada event yang diikuti.</div>
        @endforelse
    </div>
    <div class="mt-4">{{ $registrations->links() }}</div>
</div>
@endsection
