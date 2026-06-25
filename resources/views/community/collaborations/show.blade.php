@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">{{ $collaboration->title }}</h1>
        <p class="text-komuna-muted">Detail Collaboration Request</p>
    </div>
    <a href="{{ route('community.collaborations.index') }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Detail Collaboration</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-komuna-muted">Judul</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->title }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tipe</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->collaboration_type }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($collaboration->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                        @elseif($collaboration->status === 'accepted') bg-komuna-success-soft text-komuna-success
                        @elseif($collaboration->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                        @elseif($collaboration->status === 'cancelled') bg-komuna-border-soft text-komuna-text
                        @else bg-komuna-light text-komuna-blue
                        @endif">
                        {{ ucfirst($collaboration->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Budget</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->budget ? 'Rp ' . number_format($collaboration->budget) : '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tanggal Event</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->event_date?->format('d M Y') ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Dibuat Oleh</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->creator->name }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Person</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->contact_person ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Email</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->contact_email ?? '-' }}</p>
                </div>
            </div>

            @if($collaboration->proposal)
                <div class="mt-6">
                    <p class="text-xs text-komuna-muted mb-1">Proposal</p>
                    <div class="text-sm text-komuna-text whitespace-pre-line bg-komuna-surface rounded-lg p-4">{{ $collaboration->proposal }}</div>
                </div>
            @endif

            @if($collaboration->response_notes)
                <div class="mt-4">
                    <p class="text-xs text-komuna-muted mb-1">Response Notes</p>
                    <div class="text-sm text-komuna-text whitespace-pre-line bg-komuna-light rounded-lg p-4">{{ $collaboration->response_notes }}</div>
                </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Info Tambahan</h3>
            <div class="space-y-3">
                @if($collaboration->brand)
                    <div class="flex justify-between text-sm">
                        <span class="text-komuna-muted">Brand</span>
                        <span class="font-medium text-komuna-text">{{ $collaboration->brand->name }}</span>
                    </div>
                @endif
                @if($collaboration->senderCommunity)
                    <div class="flex justify-between text-sm">
                        <span class="text-komuna-muted">Dari Komunitas</span>
                        <span class="font-medium text-komuna-text">{{ $collaboration->senderCommunity->name }}</span>
                    </div>
                @endif
                <div class="flex justify-between text-sm">
                    <span class="text-komuna-muted">Ke Komunitas</span>
                    <span class="font-medium text-komuna-text">{{ $collaboration->community->name }}</span>
                </div>
                @if($collaboration->responded_at)
                    <div class="flex justify-between text-sm">
                        <span class="text-komuna-muted">Direspon</span>
                        <span class="font-medium text-komuna-text">{{ $collaboration->responded_at->format('d M Y H:i') }}</span>
                    </div>
                @endif
            </div>
        </div>

        @if($collaboration->status === 'pending' && auth()->user()->id === ($collaboration->community->owner_id ?? null))
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                <h3 class="font-semibold text-komuna-text mb-3">Action</h3>
                <div class="space-y-3">
                    <form action="{{ route('community.collaborations.accept', $collaboration) }}" method="POST">
                        @csrf
                        <div class="mb-3">
                            <textarea name="response_notes" rows="2" placeholder="Catatan (opsional)" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">Accept</button>
                    </form>
                    <form action="{{ route('community.collaborations.reject', $collaboration) }}" method="POST">
                        @csrf
                        <div class="mb-3">
                            <textarea name="response_notes" rows="2" placeholder="Alasan penolakan" class="w-full border border-komuna-border rounded-lg px-3 py-2 text-sm"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Reject</button>
                    </form>
                </div>
            </div>
        @endif

        @if($collaboration->status === 'accepted' && auth()->user()->id === ($collaboration->community->owner_id ?? null))
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                <form action="{{ route('community.collaborations.complete', $collaboration) }}" method="POST">
                    @csrf
                    <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Tandai Selesai</button>
                </form>
            </div>
        @endif

        @if($collaboration->status === 'pending')
            @php
                $userId = auth()->user()->id;
                $isSender = ($collaboration->brand && $collaboration->brand->owner_id === $userId) || ($collaboration->senderCommunity && $collaboration->senderCommunity->owner_id === $userId);
            @endphp
            @if($isSender)
                <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
                    <form action="{{ route('community.collaborations.cancel', $collaboration) }}" method="POST" onsubmit="return confirm('Batalkan request ini?')">
                        @csrf
                        <button type="submit" class="w-full bg-komuna-navy-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-navy-dark transition">Batalkan Request</button>
                    </form>
                </div>
            @endif
        @endif
    </div>
</div>
@endsection
