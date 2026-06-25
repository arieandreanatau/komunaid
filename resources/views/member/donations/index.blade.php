@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Donasi Saya</h1>
    <p class="text-komuna-muted">Riwayat donasi yang telah Anda berikan.</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    @if($donations->isEmpty())
        <div class="text-center py-8 text-komuna-light-text">
            <div class="text-4xl mb-3">❤️</div>
            <p>Belum ada donasi.</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-komuna-border-soft">
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Tanggal</th>
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Tipe</th>
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Tujuan</th>
                        <th class="text-right py-3 px-2 font-medium text-komuna-muted">Jumlah</th>
                        <th class="text-center py-3 px-2 font-medium text-komuna-muted">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($donations as $donation)
                        <tr class="border-b border-komuna-border-soft hover:bg-komuna-surface">
                            <td class="py-3 px-2 text-komuna-muted">{{ $donation->created_at->format('d M Y') }}</td>
                            <td class="py-3 px-2 text-komuna-text">
                                @if($donation->donation_type === 'event_donation')
                                    Event
                                @elseif($donation->donation_type === 'community_donation')
                                    Komunitas
                                @else
                                    CSR
                                @endif
                            </td>
                            <td class="py-3 px-2 text-komuna-text">
                                {{ $donation->event?->title ?? $donation->community?->name ?? '-' }}
                            </td>
                            <td class="py-3 px-2 text-right font-semibold text-komuna-text">
                                Rp {{ number_format($donation->amount, 0, ',', '.') }}
                            </td>
                            <td class="py-3 px-2 text-center">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($donation->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                    @elseif($donation->status === 'confirmed') bg-komuna-success-soft text-komuna-success
                                    @else bg-komuna-danger-soft text-komuna-danger @endif">
                                    {{ ucfirst($donation->status) }}
                                </span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-4">
            {{ $donations->links() }}
        </div>
    @endif
</div>
@endsection
