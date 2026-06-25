@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">Wallet Management</h1>
    <p class="text-[#64748B]">Kelola saldo dan transaksi semua user.</p>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
    <form method="GET" action="{{ route('superadmin.wallets.index') }}" class="flex gap-2">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama atau email..."
            class="flex-1 border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-[#126BFF]">
        <button type="submit" class="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">Cari</button>
    </form>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-[#EEF7FF]">
                <tr>
                    <th class="text-left py-3 px-4 font-semibold text-[#0B2D89]">User</th>
                    <th class="text-left py-3 px-4 font-semibold text-[#0B2D89]">Email</th>
                    <th class="text-right py-3 px-4 font-semibold text-[#0B2D89]">Saldo</th>
                    <th class="text-center py-3 px-4 font-semibold text-[#0B2D89]">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($users as $userItem)
                    <tr class="border-t border-[#E2E8F0] hover:bg-[#EEF7FF]/50">
                        <td class="py-3 px-4">
                            <a href="{{ route('superadmin.wallets.show', $userItem) }}" class="font-medium text-[#0F172A] hover:text-[#126BFF]">
                                {{ $userItem->name }}
                            </a>
                        </td>
                        <td class="py-3 px-4 text-[#64748B]">{{ $userItem->email }}</td>
                        <td class="py-3 px-4 text-right font-bold text-[#126BFF]">
                            Rp {{ number_format($userItem->wallet?->balance ?? 0, 0, ',', '.') }}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <a href="{{ route('superadmin.wallets.show', $userItem) }}" class="text-[#126BFF] hover:underline text-xs font-medium">Detail</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="py-8 text-center text-[#64748B]/60">Tidak ada data.</td>
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
