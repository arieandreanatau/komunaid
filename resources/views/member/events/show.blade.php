@extends('layouts.app')

@section('content')
<div class="mb-8">
    <a href="{{ route('events.index') }}" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">&larr; Kembali ke Events</a>
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{{ $event->title }}</h1>
    <p class="text-gray-600">{{ $event->community->name }}</p>
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
                    <p class="text-xs text-gray-500">Lokasi</p>
                    <p class="text-sm font-medium text-gray-900">{{ ucfirst($event->location_type) }} {{ $event->location_address ? '- ' . $event->location_address : '' }}</p>
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
                    <p class="text-sm font-medium text-gray-900">{{ $event->capacity ? $event->remaining_capacity . ' / ' . $event->capacity : 'Unlimited' }}</p>
                </div>
                @if($event->isPaid())
                    <div>
                        <p class="text-xs text-gray-500">Harga</p>
                        <p class="text-sm font-medium text-gray-900">Rp {{ number_format($event->price) }}</p>
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

        @if($event->galleries->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Gallery</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    @foreach($event->galleries->take(6) as $gallery)
                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img src="{{ Storage::url($gallery->image_path) }}" alt="" class="w-full h-full object-cover">
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        @if($event->chats->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Forum / Chat</h2>
                <div class="space-y-3">
                    @foreach($event->chats->take(5) as $chat)
                        <a href="{{ route('member.events.chat.show', [$event, $chat]) }}" class="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                            <div class="flex items-center gap-2">
                                @if($chat->is_pinned)
                                    <span class="text-yellow-500 text-sm">📌</span>
                                @endif
                                <h3 class="font-semibold text-gray-900 text-sm">{{ $chat->title }}</h3>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">{{ $chat->creator->name }} &middot; {{ $chat->created_at->diffForHumans() }} &middot; {{ $chat->approvedThreads->count() }} balasan</p>
                        </a>
                    @endforeach
                </div>
            </div>
        @endif
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Registrasi</h3>
            @if($registration)
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Status</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium
                            @if($registration->status === 'registered') bg-green-100 text-green-800
                            @else bg-red-100 text-red-800
                            @endif">
                            {{ ucfirst($registration->status) }}
                        </span>
                    </div>
                    @if($registration->payment_status)
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Pembayaran</span>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                @if($registration->payment_status === 'paid') bg-green-100 text-green-800
                                @elseif($registration->payment_status === 'waiting_confirmation') bg-yellow-100 text-yellow-800
                                @elseif($registration->payment_status === 'unpaid') bg-gray-100 text-gray-800
                                @else bg-red-100 text-red-800
                                @endif">
                                {{ str_replace('_', ' ', ucfirst($registration->payment_status)) }}
                            </span>
                        </div>
                    @endif

                    @if($event->isPaid() && $registration->status === 'registered' && $registration->payment_status === 'unpaid')
                        <div class="mt-4 pt-4 border-t border-gray-100">
                            <h4 class="text-sm font-semibold text-gray-900 mb-2">Upload Bukti Pembayaran</h4>
                            <form action="{{ route('member.events.upload-payment', [$event, $registration]) }}" method="POST" enctype="multipart/form-data" class="space-y-3">
                                @csrf
                                <input type="file" name="proof_image" accept="image/*" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                <input type="number" name="amount_paid" value="{{ $event->price }}" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Jumlah bayar">
                                <input type="text" name="bank_name" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nama Bank">
                                <input type="text" name="account_name" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nama Pemilik Rekening">
                                <button type="submit" class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Kirim Bukti</button>
                            </form>
                        </div>
                    @endif

                    @if($registration->status === 'registered' && $registration->canCancel())
                        <form action="{{ route('member.events.cancel', [$event, $registration]) }}" method="POST" class="mt-4 pt-4 border-t border-gray-100">
                            @csrf
                            <button type="submit" onclick="return confirm('Yakin ingin membatalkan registrasi?')" class="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition">Batalkan Registrasi</button>
                        </form>
                    @endif
                </div>
            @elseif($event->isOpenForRegistration() && !$event->isFull())
                <form action="{{ route('member.events.register', $event) }}" method="POST" class="space-y-3">
                    @csrf
                    <textarea name="notes" rows="2" placeholder="Catatan (opsional)" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
                    <button type="submit" class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Daftar Event</button>
                </form>
            @elseif($event->isFull())
                <p class="text-red-600 text-sm font-medium">Event sudah penuh.</p>
            @else
                <p class="text-gray-500 text-sm">Registrasi tidak tersedia.</p>
            @endif
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Info Komunitas</h3>
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    @if($event->community->logo)
                        <img src="{{ Storage::url($event->community->logo) }}" alt="" class="w-full h-full object-cover">
                    @else
                        {{ substr($event->community->name, 0, 1) }}
                    @endif
                </div>
                <div>
                    <p class="font-semibold text-gray-900 text-sm">{{ $event->community->name }}</p>
                    <p class="text-xs text-gray-500">{{ $event->community->city ?? '-' }}</p>
                </div>
            </div>
            @if($event->community->description)
                <p class="text-sm text-gray-600">{{ Str::limit($event->community->description, 150) }}</p>
            @endif
        </div>
    </div>
</div>
@endsection
