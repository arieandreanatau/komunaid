@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Collaboration Request</h1>
        <p class="text-komuna-muted">{{ $collaboration->title }}</p>
    </div>
    <div class="flex items-center gap-3">
        @if($collaboration->status === 'pending')
            <form action="{{ route('brand.collaborations.destroy', $collaboration) }}" method="POST" onsubmit="return confirm('Yakin ingin membatalkan?')">
                @csrf
                @method('DELETE')
                <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Batalkan</button>
            </form>
        @endif
        <a href="{{ route('brand.collaborations.index') }}" class="text-komuna-muted text-sm hover:text-komuna-text">Kembali</a>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Detail Pengajuan</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-komuna-muted">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($collaboration->status === 'accepted') bg-komuna-success-soft text-komuna-success
                        @elseif($collaboration->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                        @elseif($collaboration->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                        @else bg-komuna-border-soft text-komuna-text
                        @endif">
                        {{ ucfirst($collaboration->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Tipe Kolaborasi</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($collaboration->collaboration_type === 'free_collaboration') bg-komuna-success-soft text-komuna-success
                        @elseif($collaboration->collaboration_type === 'paid_collaboration') bg-komuna-light text-komuna-blue
                        @elseif($collaboration->collaboration_type === 'sponsorship') bg-komuna-info-soft text-komuna-info
                        @elseif($collaboration->collaboration_type === 'csr_donation') bg-komuna-warning-soft text-orange-800
                        @else bg-teal-100 text-teal-800
                        @endif">
                        @switch($collaboration->collaboration_type)
                            @case('free_collaboration') Free Collaboration @break
                            @case('paid_collaboration') Paid Collaboration @break
                            @case('sponsorship') Sponsorship @break
                            @case('csr_donation') CSR Donation @break
                            @case('tap_in_event') Tap-in Event @break
                            @default {{ $collaboration->collaboration_type }}
                        @endswitch
                    </span>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Brand</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->brand->name }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Komunitas</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->community->name }}</p>
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
                    <p class="text-xs text-komuna-muted">Contact Person</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->contact_person ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Email</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->contact_email ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Contact Phone</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->contact_phone ?? '-' }}</p>
                </div>
                <div>
                    <p class="text-xs text-komuna-muted">Dikirim Oleh</p>
                    <p class="text-sm font-medium text-komuna-text">{{ $collaboration->creator->name ?? '-' }}</p>
                </div>
            </div>

            @if($collaboration->proposal)
                <div class="mt-6">
                    <p class="text-xs text-komuna-muted mb-1">Proposal</p>
                    <div class="text-sm text-komuna-text whitespace-pre-line bg-komuna-surface rounded-lg p-4">{{ $collaboration->proposal }}</div>
                </div>
            @endif

            @if($collaboration->response_notes)
                <div class="mt-6">
                    <p class="text-xs text-komuna-muted mb-1">Response dari Komunitas</p>
                    <div class="text-sm text-komuna-text whitespace-pre-line bg-komuna-light rounded-lg p-4">{{ $collaboration->response_notes }}</div>
                </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Ringkasan</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Dikirim</span>
                    <span class="font-medium text-komuna-text">{{ $collaboration->created_at->format('d M Y') }}</span>
                </div>
                @if($collaboration->responded_at)
                    <div class="flex justify-between">
                        <span class="text-komuna-muted">Direspon</span>
                        <span class="font-medium text-komuna-text">{{ $collaboration->responded_at->format('d M Y') }}</span>
                    </div>
                @endif
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Komunitas</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Nama</span>
                    <span class="font-medium text-komuna-text">{{ $collaboration->community->name }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-komuna-muted">Status</span>
                    <span class="font-medium text-komuna-text">{{ ucfirst($collaboration->community->status) }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
