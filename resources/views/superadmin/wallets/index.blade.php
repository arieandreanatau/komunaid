@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Wallet Management</h1>
    <p class="text-gray-600">Kelola saldo dan transaksi semua user.</p>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
    <form method="GET" action="{{ route('superadmin.wallets.index') }}" class="flex gap-2">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama atau email..."
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Cari</button>
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left py-3 px-4 font-medium text-gray-500">User</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                    <th class="text-right py-3 px-4 font-medium text-gray-500">Saldo</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-500">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($users as $userItem)
                    <tr class="border-t border-gray-50 hover:bg-gray-50">
                        <td class="py-3 px-4">
                            <a href="{{ route('superadmin.wallets.show', $userItem) }}" class="font-medium text-gray-900 hover:text-emerald-600">
                                {{ $userItem->name }}
                            </a>
                        </td>
                        <td class="py-3 px-4 text-gray-600">{{ $userItem->email }}</td>
                        <td class="py-3 px-4 text-right font-bold text-emerald-600">
                            Rp {{ number_format($userItem->wallet?->balance ?? 0, 0, ',', '.') }}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <a href="{{ route('superadmin.wallets.show', $userItem) }}" class="text-emerald-600 hover:underline text-xs font-medium">Detail</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="py-8 text-center text-gray-400">Tidak ada data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="p-4">
        {{ $users->withQueryString()->links() }}
    </div>
</div>
@endsection
