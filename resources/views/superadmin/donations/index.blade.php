@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Donation Management</h1>
    <p class="text-gray-600">Kelola seluruh donasi di platform.</p>
</div>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <p class="text-xs text-gray-500">Pending</p>
        <p class="text-2xl font-bold text-yellow-600">{{ $stats['total_pending'] }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <p class="text-xs text-gray-500">Confirmed</p>
        <p class="text-2xl font-bold text-green-600">{{ $stats['total_confirmed'] }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <p class="text-xs text-gray-500">Rejected</p>
        <p class="text-2xl font-bold text-red-600">{{ $stats['total_rejected'] }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <p class="text-xs text-gray-500">Total Amount</p>
        <p class="text-2xl font-bold text-emerald-600">Rp {{ number_format($stats['total_amount'], 0, ',', '.') }}</p>
    </div>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-2 mb-4 flex-wrap">
        <a href="{{ route('superadmin.donations.index') }}" class="px-3 py-1 rounded-full text-xs font-medium {{ !request('status') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600' }}">Semua</a>
        <a href="{{ route('superadmin.donations.index', ['status' => 'pending']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600' }}">Pending</a>
        <a href="{{ route('superadmin.donations.index', ['status' => 'confirmed']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600' }}">Confirmed</a>
        <a href="{{ route('superadmin.donations.index', ['status' => 'rejected']) }}" class="px-3 py-1 rounded-full text-xs font-medium {{ request('status') === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600' }}">Rejected</a>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">ID</th>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">Donatur</th>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">Tipe</th>
                    <th class="text-left py-3 px-3 font-medium text-gray-500">Tujuan</th>
                    <th class="text-right py-3 px-3 font-medium text-gray-500">Jumlah</th>
                    <th class="text-center py-3 px-3 font-medium text-gray-500">Status</th>
                    <th class="text-center py-3 px-3 font-medium text-gray-500">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($donations as $donation)
                    <tr class="border-t border-gray-50 hover:bg-gray-50">
                        <td class="py-3 px-3 text-gray-600">#{{ $donation->id }}</td>
                        <td class="py-3 px-3 text-gray-900">{{ $donation->donor->name }}</td>
                        <td class="py-3 px-3 text-gray-900">{{ $donation->donation_type }}</td>
                        <td class="py-3 px-3 text-gray-900">{{ $donation->event?->title ?? $donation->community?->name ?? '-' }}</td>
                        <td class="py-3 px-3 text-right font-semibold text-gray-900">Rp {{ number_format($donation->amount, 0, ',', '.') }}</td>
                        <td class="py-3 px-3 text-center">
                            <span class="px-2 py-1 rounded-full text-xs font-medium
                                @if($donation->status === 'pending') bg-yellow-100 text-yellow-800
                                @elseif($donation->status === 'confirmed') bg-green-100 text-green-800
                                @else bg-red-100 text-red-800 @endif">
                                {{ ucfirst($donation->status) }}
                            </span>
                        </td>
                        <td class="py-3 px-3 text-center">
                            <div class="flex items-center justify-center gap-1">
                                @if($donation->status === 'pending')
                                    <form method="POST" action="{{ route('superadmin.donations.confirm', $donation) }}" class="inline">
                                        @csrf
                                        <button type="submit" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Confirm</button>
                                    </form>
                                    <form method="POST" action="{{ route('superadmin.donations.reject', $donation) }}" class="inline">
                                        @csrf
                                        <button type="submit" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Reject</button>
                                    </form>
                                @endif
                                <a href="{{ route('superadmin.donations.show', $donation) }}" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Detail</a>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="py-8 text-center text-gray-400">Tidak ada data donasi.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">
        {{ $donations->withQueryString()->links() }}
    </div>
</div>
@endsection
