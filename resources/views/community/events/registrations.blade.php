@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Registrasi Event</h1>
        <p class="text-gray-600">{{ $event->title }}</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Kembali</a>
</div>

@if($registrations->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peserta</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($registrations as $reg)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                                        {{ substr($reg->user->name, 0, 1) }}
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-900 text-sm">{{ $reg->user->name }}</p>
                                        <p class="text-xs text-gray-500">{{ $reg->user->email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($reg->status === 'registered') bg-green-100 text-green-800
                                    @else bg-red-100 text-red-800
                                    @endif">
                                    {{ ucfirst($reg->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                @if($reg->payment_status)
                                    <span class="px-2 py-1 rounded-full text-xs font-medium
                                        @if($reg->payment_status === 'paid') bg-green-100 text-green-800
                                        @elseif($reg->payment_status === 'waiting_confirmation') bg-yellow-100 text-yellow-800
                                        @elseif($reg->payment_status === 'unpaid') bg-gray-100 text-gray-800
                                        @elseif($reg->payment_status === 'rejected') bg-red-100 text-red-800
                                        @else bg-red-100 text-red-800
                                        @endif">
                                        {{ str_replace('_', ' ', ucfirst($reg->payment_status)) }}
                                    </span>
                                @else
                                    <span class="text-gray-400 text-xs">-</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $reg->registered_at?->format('d M Y H:i') ?? '-' }}</td>
                            <td class="px-6 py-4">
                                @if($reg->payment_status === 'waiting_confirmation' && $reg->paymentConfirmation)
                                    <div class="flex items-center gap-2">
                                        <button onclick="document.getElementById('proof-{{ $reg->id }}').classList.toggle('hidden')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Lihat Bukti</button>
                                        <form action="{{ route('community.events.confirm-payment', [$event, $reg]) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="text-green-600 hover:text-green-800 text-sm font-medium">Konfirmasi</button>
                                        </form>
                                        <button onclick="document.getElementById('reject-form-{{ $reg->id }}').classList.toggle('hidden')" class="text-red-600 hover:text-red-800 text-sm font-medium">Tolak</button>
                                    </div>
                                    <div id="proof-{{ $reg->id }}" class="hidden mt-2">
                                        <img src="{{ Storage::url($reg->paymentConfirmation->proof_image) }}" alt="Bukti" class="w-48 rounded-lg border">
                                        <p class="text-xs text-gray-500 mt-1">Rp {{ number_format($reg->paymentConfirmation->amount_paid) }} | {{ $reg->paymentConfirmation->bank_name ?? '-' }}</p>
                                    </div>
                                    <div id="reject-form-{{ $reg->id }}" class="hidden mt-2">
                                        <form action="{{ route('community.events.reject-payment', [$event, $reg]) }}" method="POST" class="flex gap-2">
                                            @csrf
                                            <input type="text" name="admin_notes" placeholder="Alasan penolakan" class="border rounded px-2 py-1 text-xs flex-1">
                                            <button type="submit" class="bg-red-600 text-white px-3 py-1 rounded text-xs">Tolak</button>
                                        </form>
                                    </div>
                                @else
                                    <span class="text-gray-400 text-xs">-</span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
            {{ $registrations->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">👥</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Registrasi</h3>
        <p class="text-gray-500 text-sm">Belum ada peserta yang mendaftar di event ini.</p>
    </div>
@endif
@endsection
