@extends('layouts.app')
@section('title', 'Campaign Saya')
@section('content')
<div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-navy">Campaign</h1>
        <a href="{{ route('brand-owner.campaigns.create') }}" class="bg-blue hover:bg-navy text-white px-4 py-2 rounded-lg text-sm transition">+ Buat Campaign</a>
    </div>

    @if($campaigns->count() > 0)
        <div class="bg-white rounded-xl border overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($campaigns as $campaign)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <a href="{{ route('brand-owner.campaigns.show', $campaign) }}" class="font-semibold text-sm text-navy hover:underline">{{ $campaign->title }}</a>
                                <p class="text-xs text-gray-400">{{ $campaign->start_date?->format('d M Y') ?? '-' }} - {{ $campaign->end_date?->format('d M Y') ?? '-' }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $campaign->brand->name }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">Rp {{ number_format($campaign->budget ?? 0) }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($campaign->status === 'active') bg-green-100 text-green-800
                                    @elseif($campaign->status === 'draft') bg-gray-100 text-gray-800
                                    @elseif($campaign->status === 'completed') bg-blue-100 text-blue-800
                                    @else bg-yellow-100 text-yellow-800
                                    @endif">{{ ucfirst($campaign->status) }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('brand-owner.campaigns.show', $campaign) }}" class="text-blue text-sm hover:underline">Detail</a>
                                    <a href="{{ route('brand-owner.campaigns.edit', $campaign) }}" class="text-blue text-sm hover:underline">Edit</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $campaigns->links() }}</div>
    @else
        <div class="bg-white rounded-xl border p-8 text-center">
            <p class="text-gray-400 mb-4">Belum ada campaign.</p>
            <a href="{{ route('brand-owner.campaigns.create') }}" class="bg-blue hover:bg-navy text-white px-5 py-2 rounded-lg text-sm transition">Buat Campaign</a>
        </div>
    @endif
</div>
@endsection
