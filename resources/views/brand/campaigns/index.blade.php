@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Campaign</h1>
        <p class="text-gray-600">Kelola semua campaign brand Anda.</p>
    </div>
    <a href="{{ route('brand.campaigns.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        + Buat Campaign
    </a>
</div>

<div class="flex items-center gap-2 mb-6">
    <a href="{{ route('brand.campaigns.index') }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('status') ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Semua</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'draft']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'draft' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Draft</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'active']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Active</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'paused']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Paused</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'completed']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">Completed</a>
</div>

@if($campaigns->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($campaigns as $campaign)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <a href="{{ route('brand.campaigns.show', $campaign) }}" class="font-semibold text-gray-900 text-sm hover:text-indigo-600">{{ $campaign->title }}</a>
                                <p class="text-xs text-gray-500">{{ Str::limit($campaign->description, 60) ?? '-' }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $campaign->brand->name }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $campaign->campaign_type ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($campaign->status === 'active') bg-green-100 text-green-800
                                    @elseif($campaign->status === 'draft') bg-gray-100 text-gray-800
                                    @elseif($campaign->status === 'paused') bg-yellow-100 text-yellow-800
                                    @elseif($campaign->status === 'completed') bg-blue-100 text-blue-800
                                    @else bg-red-100 text-red-800
                                    @endif">
                                    {{ ucfirst($campaign->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">
                                {{ $campaign->start_date?->format('d M Y') ?? '-' }} - {{ $campaign->end_date?->format('d M Y') ?? '-' }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('brand.campaigns.show', $campaign) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a>
                                    <a href="{{ route('brand.campaigns.edit', $campaign) }}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
            {{ $campaigns->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">📢</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Campaign</h3>
        <p class="text-gray-500 text-sm mb-4">Buat campaign pertama Anda.</p>
        <a href="{{ route('brand.campaigns.create') }}" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Buat Campaign
        </a>
    </div>
@endif
@endsection
