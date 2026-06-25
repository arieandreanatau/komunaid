@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Donasi - {{ $event->title }}</h1>
        <p class="text-komuna-muted">Kelola donasi event.</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
</div>
@if($donations->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Donor</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Payment</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Donated At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Proof</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($donations as $donation)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4 text-sm font-medium text-komuna-text">{{ $donation->user->name ?? $donation->donor_name ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $donation->user->email ?? $donation->donor_email ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-text font-medium">Rp {{ number_format($donation->amount) }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ ucfirst($donation->payment_method ?? '-' ) }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($donation->status === 'verified') bg-komuna-success-soft text-komuna-success
                                    @elseif($donation->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                    @else bg-komuna-warning-soft text-komuna-warning @endif">
                                    {{ ucfirst($donation->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $donation->created_at->format('d M Y H:i') }}</td>
                            <td class="px-6 py-4">
                                @if($donation->proof)
                                    <a href="{{ asset('storage/' . $donation->proof) }}" target="_blank" class="text-komuna-success hover:text-komuna-success text-sm">View</a>
                                @else - @endif
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    @if($donation->status === 'pending')
                                        <form action="{{ route('community.events.donations.verify', [$event, $donation]) }}" method="POST" class="inline">@csrf<button type="submit" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Verify</button></form>
                                        <form action="{{ route('community.events.donations.reject', [$event, $donation]) }}" method="POST" class="inline" onsubmit="return confirm('Tolak donasi ini?')">@csrf<button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Reject</button></form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $donations->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">&#128176;</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Donasi</h3>
        <p class="text-komuna-muted text-sm">Donasi belum masuk.</p>
    </div>
@endif
@endsection