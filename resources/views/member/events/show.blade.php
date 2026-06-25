@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <a href="{{ route('events.index') }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">&larr; Kembali ke Events</a>
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text mt-2">{{ $event->title }}</h1>
    <p class="text-komuna-muted">{{ $event->community->name }}</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Detail Event</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-komuna-muted">Tipe Event</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($event->event_type === 'paid') bg-komuna-info-soft text-komuna-info
                        @elseif($event->event_type === 'free') bg-komuna-success-soft text-komuna-success
                        @elseif($event->event_type === 'volunteer') bg-teal-100 text-teal-800
                        @elseif($event->event_type === 'charity') bg-komuna-warning-soft text-orange-800
                        @else bg-komuna-light text-komuna-blue @endif">
                        {{ ucfirst($event->event_type) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Lokasi</p>
                    <p class="text-sm font-medium text-komuna-text">{{ ucfirst($event->location_type) }} {{ $event->location_address ? '- ' . $event->location_address : '' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tanggal Mulai</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $event->start_datetime->format('d M Y H:i') }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tanggal Selesai</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $event->end_datetime->format('d M Y H:i') }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Kapasitas</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $event->capacity ? $event->remaining_capacity . ' / ' . $event->capacity : 'Unlimited' }}</p>
                </div>
                @if($event->isPaid())
                    <div>
                        <p class="text-xs text-komuna-muted">Harga</p>
                        <p class="text-sm font-medium text-komuna-text">Rp {{ number_format($event->price) }}</p>
                    </div>
                @endif
            </div>
            @if($event->description)
                <div class="mt-6">
                    <p class="text-xs text-komuna-muted mb-1">Deskripsi</p>
                    <p class="text-sm text-komuna-text">{{ $event->description }}</p>
                </div>
            @endif
        </div>
        @if($event->volunteerCampaigns && $event->volunteerCampaigns->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
                <h2 class="text-lg font-semibold text-komuna-text mb-4">Kampanye Volunteer</h2>
                <div class="space-y-3">
                    @foreach($event->volunteerCampaigns as $campaign)
                        <div class="bg-komuna-surface rounded-lg p-4">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="font-semibold text-komuna-text text-sm">{{ $campaign->title }}</h3>
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $campaign->status === 'open' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted' }}">
                                    {{ ucfirst($campaign->status) }}
                                </span>
                            </div>
                            @if($campaign->description)
                                <p class="text-xs text-komuna-muted mb-2">{{ Str::limit($campaign->description, 120) }}</p>
                            @endif
                            @if($campaign->required_count)
                                <p class="text-xs text-komuna-muted">Dibutuhkan: {{ $campaign->required_count }} orang</p>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        @if($event->galleries->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
                <h2 class="text-lg font-semibold text-komuna-text mb-4">Gallery</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    @foreach($event->galleries->take(6) as $gallery)
                        <div class="aspect-square bg-komuna-border-soft rounded-lg overflow-hidden">
                            <img src="{{ Storage::url($gallery->image_path) }}" alt="" class="w-full h-full object-cover">
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        @if($event->chats->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
                <h2 class="text-lg font-semibold text-komuna-text mb-4">Forum / Chat</h2>
                <div class="space-y-3">
                    @foreach($event->chats->take(5) as $chat)
                        <a href="{{ route('member.events.chat.show', [$event, $chat]) }}" class="block bg-komuna-surface rounded-lg p-4 hover:bg-komuna-border-soft transition">
                            <div class="flex items-center gap-2">
                                @if($chat->is_pinned)
                                    <span class="text-yellow-500 text-sm">&#x1F4CC;</span>
                                @endif
                                <h3 class="font-semibold text-komuna-text text-sm">{{ $chat->title }}</h3>
                            </div>
                            <p class="text-xs text-komuna-muted mt-1">{{ $chat->creator->name }} &middot; {{ $chat->created_at->diffForHumans() }} &middot; {{ $chat->approvedThreads->count() }} balasan</p>
                        </a>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Registrasi</h3>
            @if($registration)
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-komuna-muted">Status</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium
                            @if($registration->status === 'registered') bg-komuna-success-soft text-komuna-success
                            @else bg-komuna-danger-soft text-komuna-danger @endif">
                            {{ ucfirst($registration->status) }}
                        </span>
                    </div>
                    @if($registration->payment_status)
                        <div class="flex justify-between text-sm">
                            <span class="text-komuna-muted">Pembayaran</span>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                @if($registration->payment_status === 'paid') bg-komuna-success-soft text-komuna-success
                                @elseif($registration->payment_status === 'waiting_confirmation') bg-komuna-warning-soft text-komuna-warning
                                @elseif($registration->payment_status === 'unpaid') bg-komuna-border-soft text-komuna-text
                                @else bg-komuna-danger-soft text-komuna-danger @endif">
                                {{ str_replace('_', ' ', ucfirst($registration->payment_status)) }}
                            </span>
                        </div>
                    @endif
                    @if($event->isPaid() && $registration->status === 'registered' && $registration->payment_status === 'unpaid')
                        <div class="mt-4 pt-4 border-t border-komuna-border-soft">
                            <h4 class="text-sm font-semibold text-komuna-text mb-2">Upload Bukti Pembayaran</h4>
                            <form action="{{ route('member.events.upload-payment', [$event, $registration]) }}" method="POST" enctype="multipart/form-data" class="space-y-3">
                                @csrf
                                <input type="file" name="proof_image" accept="image/*" required class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm">
                                <input type="number" name="amount_paid" value="{{ $event->price }}" min="0" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm" placeholder="Jumlah bayar">
                                <input type="text" name="bank_name" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm" placeholder="Nama Bank">
                                <input type="text" name="account_name" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm" placeholder="Nama Pemilik Rekening">
                                <button type="submit" class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Kirim Bukti</button>
                            </form>
                        </div>
                    @endif
                    @if($registration->status === 'registered' && $registration->canCancel())
                        <form action="{{ route('member.events.cancel', [$event, $registration]) }}" method="POST" class="mt-4 pt-4 border-t border-komuna-border-soft">
                            @csrf
                            <button type="submit" onclick="return confirm('Yakin ingin membatalkan registrasi?')" class="w-full bg-komuna-danger-soft text-komuna-danger px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition">Batalkan Registrasi</button>
                        </form>
                    @endif
                </div>
            @elseif($event->isOpenForRegistration() && !$event->isFull())
                <form action="{{ route('member.events.register', $event) }}" method="POST" class="space-y-3">
                    @csrf
                    <textarea name="notes" rows="2" placeholder="Catatan (opsional)" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm"></textarea>
                    <button type="submit" class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Daftar Event</button>
                </form>
            @elseif($event->isFull())
                <p class="text-komuna-danger text-sm font-medium">Event sudah penuh.</p>
            @else
                <p class="text-komuna-muted text-sm">Registrasi tidak tersedia.</p>
            @endif
        </div>
        @if($event->is_open_volunteer && $event->volunteerCampaigns()->where('status', 'open')->count() > 0)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                <h3 class="font-semibold text-komuna-text mb-3">Volunteer</h3>
                @if($volunteerApplication)
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-komuna-muted">Status</span>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                @if($volunteerApplication->status === 'approved') bg-komuna-success-soft text-komuna-success
                                @elseif($volunteerApplication->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                @else bg-komuna-danger-soft text-komuna-danger @endif">
                                {{ ucfirst($volunteerApplication->status) }}
                            </span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-komuna-muted">Posisi</span>
                            <span class="text-sm font-medium text-komuna-text">{{ $volunteerApplication->position_applied ?? '-' }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-komuna-muted">Campaign</span>
                            <span class="text-sm font-medium text-komuna-text">{{ $volunteerApplication->campaign->title ?? '-' }}</span>
                        </div>
                        @if($volunteerApplication->status === 'rejected' && $volunteerApplication->rejection_reason)
                            <div class="mt-2 p-3 bg-komuna-danger-soft rounded-lg">
                                <p class="text-xs text-komuna-danger font-medium">Alasan Penolakan:</p>
                                <p class="text-xs text-komuna-danger">{{ $volunteerApplication->rejection_reason }}</p>
                            </div>
                        @endif
                    </div>
                @else
                    <p class="text-sm text-komuna-muted mb-3">Event ini membuka peluang volunteer. Daftar sekarang!</p>
                    <a href="{{ route('member.events.volunteer.apply', $event) }}" class="block w-full text-center bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
                        Apply Volunteer
                    </a>
                @endif
            </div>
        @endif

        @if($event->is_open_donation)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                <h3 class="font-semibold text-komuna-text mb-3">Donasi</h3>
                <p class="text-sm text-komuna-muted mb-3">Bantu dukung event ini melalui donasi.</p>
                <a href="{{ route('member.events.donate', $event) }}" class="block w-full text-center bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition">
                    Donasi
                </a>
            </div>
        @endif

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Info Komunitas</h3>
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    @if($event->community->logo)
                        <img src="{{ Storage::url($event->community->logo) }}" alt="" class="w-full h-full object-cover">
                    @else
                        {{ substr($event->community->name, 0, 1) }}
                    @endif
                </div>
                <div>
                    <p class="font-semibold text-komuna-text text-sm">{{ $event->community->name }}</p>
                    <p class="text-xs text-komuna-muted">{{ $event->community->city ?? '-' }}</p>
                </div>
            </div>
            @if($event->community->description)
                <p class="text-sm text-komuna-muted">{{ Str::limit($event->community->description, 150) }}</p>
            @endif
        </div>
    </div>
</div>
@endsection
