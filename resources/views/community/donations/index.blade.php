@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Donasi Masuk</h1>
    <p class="text-komuna-muted">Kelola donasi yang masuk ke komunitas Anda.</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <p class="text-xs text-komuna-muted">Pending</p>
        <p class="text-2xl font-bold text-komuna-warning">{{ $stats['total_pending'] }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <p class="text-xs text-komuna-muted">Confirmed</p>
        <p class="text-2xl font-bold text-komuna-success">{{ $stats['total_confirmed'] }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-komuna-border-soft">
        <p class="text-xs text-komuna-muted">Total Diterima</p>
        <p class="text-2xl font-bold text-komuna-success">Rp {{ number_format($stats['total_amount'], 0, ',', '.') }}</p>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
    <div class="flex items-center gap-2 mb-4">
        <a href="{{ route('community.donations.index') }}" class="px-3 py-1 rounded-full text-xs font-medium {{ !request('status') ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted' }}">Semua</a>
        <a href="{{ route('community.donations.index', ['status' => 'pending']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'pending' ? 'bg-komuna-warning-soft text-komuna-warning' : 'bg-komuna-border-soft text-komuna-muted' }}">Pending</a>
        <a href="{{ route('community.donations.index', ['status' => 'confirmed']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'confirmed' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted' }}">Confirmed</a>
    </div>

    @if($donations->isEmpty())
        <div class="text-center py-8 text-komuna-light-text">
            <p>Belum ada donasi.</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-komuna-border-soft">
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Tanggal</th>
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Donatur</th>
                        <th class="text-left py-3 px-2 font-medium text-komuna-muted">Tipe</th>
                        <th class="text-right py-3 px-2 font-medium text-komuna-muted">Jumlah</th>
                        <th class="text-center py-3 px-2 font-medium text-komuna-muted">Status</th>
                        <th class="text-center py-3 px-2 font-medium text-komuna-muted">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($donations as $donation)
                        <tr class="border-b border-komuna-border-soft hover:bg-komuna-surface">
                            <td class="py-3 px-2 text-komuna-muted">{{ $donation->created_at->format('d M Y') }}</td>
                            <td class="py-3 px-2 text-komuna-text">{{ $donation->donor->name }}</td>
                            <td class="py-3 px-2 text-komuna-text">
                                @if($donation->donation_type === 'event_donation')
                                    Event: {{ $donation->event?->title ?? '-' }}
                                @elseif($donation->donation_type === 'community_donation')
                                    Komunitas
                                @else
                                    CSR
                                @endif
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
                            <td class="py-3 px-2 text-center">
                                @if($donation->status === 'pending')
                                    <div class="flex items-center justify-center gap-1">
                                        <form method="POST" action="{{ route('community.donations.confirm', $donation) }}" class="inline">
                                            @csrf
                                            <button type="submit" class="px-2 py-1 bg-komuna-success-soft text-komuna-success rounded text-xs font-medium hover:bg-green-200">Confirm</button>
                                        </form>
                                        <form method="POST" action="{{ route('community.donations.reject', $donation) }}" class="inline">
                                            @csrf
                                            <button type="submit" class="px-2 py-1 bg-komuna-danger-soft text-komuna-danger rounded text-xs font-medium hover:bg-red-200">Reject</button>
                                        </form>
                                    </div>
                                @endif
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
