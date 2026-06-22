@extends('layouts.app')
@section('title', 'Member - Superadmin')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Data Member</h1>
    <form method="GET" class="flex gap-4 mb-6">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari member..."
            class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
        <button class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg">Cari</button>
    </form>
    <div class="bg-white rounded-xl border overflow-hidden">
        <table class="w-full">
            <thead class="bg-soft-bg">
                <tr>
                    <th class="text-left p-3 text-sm font-medium text-navy">#</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Nama</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Email</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Status</th>
                    <th class="text-left p-3 text-sm font-medium text-navy">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($members as $i => $member)
                    <tr class="hover:bg-gray-50">
                        <td class="p-3 text-sm">{{ $i + $members->firstItem() }}</td>
                        <td class="p-3 text-sm font-medium">{{ $member->name }}</td>
                        <td class="p-3 text-sm text-gray-500">{{ $member->email }}</td>
                        <td class="p-3 text-sm">
                            <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                        </td>
                        <td class="p-3">
                            <a href="{{ route('superadmin.members.show', $member->id) }}" class="text-blue hover:underline text-sm">Detail</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-4 text-center text-gray-400">Tidak ada data.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $members->withQueryString()->links() }}</div>
</div>
@endsection
