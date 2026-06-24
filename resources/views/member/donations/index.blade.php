@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Donasi Saya</h1>
    <p class="text-gray-600">Riwayat donasi yang telah Anda berikan.</p>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    @if($donations->isEmpty())
        <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-3">❤️</div>
            <p>Belum ada donasi.</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-100">
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Tanggal</th>
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Tipe</th>
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Tujuan</th>
                        <th class="text-right py-3 px-2 font-medium text-gray-500">Jumlah</th>
                        <th class="text-center py-3 px-2 font-medium text-gray-500">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($donations as $donation)
                        <tr class="border-b border-gray-50 hover:bg-gray-50">
                            <td class="py-3 px-2 text-gray-600">{{ $donation->created_at->format('d M Y') }}</td>
                            <td class="py-3 px-2 text-gray-900">
                                @if($donation->donation_type === 'event_donation')
                                    Event
                                @elseif($donation->donation_type === 'community_donation')
                                    Komunitas
                                @else
                                    CSR
                                @endif
                            </td>
                            <td class="py-3 px-2 text-gray-900">
                                {{ $donation->event?->title ?? $donation->community?->name ?? '-' }}
                            </td>
                            <td class="py-3 px-2 text-right font-semibold text-gray-900">
                                Rp {{ number_format($donation->amount, 0, ',', '.') }}
                            </td>
                            <td class="py-3 px-2 text-center">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($donation->status === 'pending') bg-yellow-100 text-yellow-800
                                    @elseif($donation->status === 'confirmed') bg-green-100 text-green-800
                                    @else bg-red-100 text-red-800 @endif">
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
