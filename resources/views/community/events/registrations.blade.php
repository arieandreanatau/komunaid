@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Registrasi Event</h1>
        <p class="text-komuna-muted">{{ $event->title }}</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
</div>

@if($registrations->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Peserta</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Payment</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tanggal Daftar</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($registrations as $reg)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-komuna-success-soft rounded-full flex items-center justify-center text-komuna-success font-bold text-sm">
                                        {{ substr($reg->user->name, 0, 1) }}
                                    </div>
                                    <div>
                                        <p class="font-semibold text-komuna-text text-sm">{{ $reg->user->name }}</p>
                                        <p class="text-xs text-komuna-muted">{{ $reg->user->email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($reg->status === 'registered') bg-komuna-success-soft text-komuna-success
                                    @else bg-komuna-danger-soft text-komuna-danger
                                    @endif">
                                    {{ ucfirst($reg->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                @if($reg->payment_status)
                                    <span class="px-2 py-1 rounded-full text-xs font-medium
                                        @if($reg->payment_status === 'paid') bg-komuna-success-soft text-komuna-success
                                        @elseif($reg->payment_status === 'waiting_confirmation') bg-komuna-warning-soft text-komuna-warning
                                        @elseif($reg->payment_status === 'unpaid') bg-komuna-border-soft text-komuna-text
                                        @elseif($reg->payment_status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                        @else bg-komuna-danger-soft text-komuna-danger
                                        @endif">
                                        {{ str_replace('_', ' ', ucfirst($reg->payment_status)) }}
                                    </span>
                                @else
                                    <span class="text-komuna-light-text text-xs">-</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $reg->registered_at?->format('d M Y H:i') ?? '-' }}</td>
                            <td class="px-6 py-4">
                                @if($reg->payment_status === 'waiting_confirmation' && $reg->paymentConfirmation)
                                    <div class="flex items-center gap-2">
                                        <button onclick="document.getElementById('proof-{{ $reg->id }}').classList.toggle('hidden')" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Lihat Bukti</button>
                                        <form action="{{ route('community.events.confirm-payment', [$event, $reg]) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Konfirmasi</button>
                                        </form>
                                        <button onclick="document.getElementById('reject-form-{{ $reg->id }}').classList.toggle('hidden')" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Tolak</button>
                                    </div>
                                    <div id="proof-{{ $reg->id }}" class="hidden mt-2">
                                        <img src="{{ Storage::url($reg->paymentConfirmation->proof_image) }}" alt="Bukti" class="w-48 rounded-lg border">
                                        <p class="text-xs text-komuna-muted mt-1">Rp {{ number_format($reg->paymentConfirmation->amount_paid) }} | {{ $reg->paymentConfirmation->bank_name ?? '-' }}</p>
                                    </div>
                                    <div id="reject-form-{{ $reg->id }}" class="hidden mt-2">
                                        <form action="{{ route('community.events.reject-payment', [$event, $reg]) }}" method="POST" class="flex gap-2">
                                            @csrf
                                            <input type="text" name="admin_notes" placeholder="Alasan penolakan" class="border rounded px-2 py-1 text-xs flex-1">
                                            <button type="submit" class="bg-red-600 text-white px-3 py-1 rounded text-xs">Tolak</button>
                                        </form>
                                    </div>
                                @else
                                    <span class="text-komuna-light-text text-xs">-</span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $registrations->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">👥</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Registrasi</h3>
        <p class="text-komuna-muted text-sm">Belum ada peserta yang mendaftar di event ini.</p>
    </div>
@endif
@endsection
