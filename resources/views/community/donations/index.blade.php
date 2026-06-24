@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Donasi Masuk</h1>
    <p class="text-gray-600">Kelola donasi yang masuk ke komunitas Anda.</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <p class="text-xs text-gray-500">Pending</p>
        <p class="text-2xl font-bold text-yellow-600">{{ $stats['total_pending'] }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <p class="text-xs text-gray-500">Confirmed</p>
        <p class="text-2xl font-bold text-green-600">{{ $stats['total_confirmed'] }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <p class="text-xs text-gray-500">Total Diterima</p>
        <p class="text-2xl font-bold text-emerald-600">Rp {{ number_format($stats['total_amount'], 0, ',', '.') }}</p>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-2 mb-4">
        <a href="{{ route('community.donations.index') }}" class="px-3 py-1 rounded-full text-xs font-medium {{ !request('status') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600' }}">Semua</a>
        <a href="{{ route('community.donations.index', ['status' => 'pending']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600' }}">Pending</a>
        <a href="{{ route('community.donations.index', ['status' => 'confirmed']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600' }}">Confirmed</a>
    </div>

    @if($donations->isEmpty())
        <div class="text-center py-8 text-gray-400">
            <p>Belum ada donasi.</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-100">
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Tanggal</th>
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Donatur</th>
                        <th class="text-left py-3 px-2 font-medium text-gray-500">Tipe</th>
                        <th class="text-right py-3 px-2 font-medium text-gray-500">Jumlah</th>
                        <th class="text-center py-3 px-2 font-medium text-gray-500">Status</th>
                        <th class="text-center py-3 px-2 font-medium text-gray-500">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($donations as $donation)
                        <tr class="border-b border-gray-50 hover:bg-gray-50">
                            <td class="py-3 px-2 text-gray-600">{{ $donation->created_at->format('d M Y') }}</td>
                            <td class="py-3 px-2 text-gray-900">{{ $donation->donor->name }}</td>
                            <td class="py-3 px-2 text-gray-900">
                                @if($donation->donation_type === 'event_donation')
                                    Event: {{ $donation->event?->title ?? '-' }}
                                @elseif($donation->donation_type === 'community_donation')
                                    Komunitas
                                @else
                                    CSR
                                @endif
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
                            <td class="py-3 px-2 text-center">
                                @if($donation->status === 'pending')
                                    <div class="flex items-center justify-center gap-1">
                                        <form method="POST" action="{{ route('community.donations.confirm', $donation) }}" class="inline">
                                            @csrf
                                            <button type="submit" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">Confirm</button>
                                        </form>
                                        <form method="POST" action="{{ route('community.donations.reject', $donation) }}" class="inline">
                                            @csrf
                                            <button type="submit" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">Reject</button>
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
