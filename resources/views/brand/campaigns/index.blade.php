@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Campaign</h1>
        <p class="text-komuna-muted">Kelola semua campaign brand Anda.</p>
    </div>
    <a href="{{ route('brand.campaigns.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        + Buat Campaign
    </a>
</div>

<div class="flex items-center gap-2 mb-6">
    <a href="{{ route('brand.campaigns.index') }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ !request('status') ? 'bg-indigo-100 text-indigo-700' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Semua</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'draft']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'draft' ? 'bg-komuna-border text-komuna-text' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Draft</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'active']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'active' ? 'bg-komuna-success-soft text-komuna-success' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Active</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'paused']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'paused' ? 'bg-komuna-warning-soft text-komuna-warning' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Paused</a>
    <a href="{{ route('brand.campaigns.index', ['status' => 'completed']) }}" class="px-3 py-1.5 rounded-lg text-sm font-medium {{ request('status') === 'completed' ? 'bg-komuna-light text-komuna-blue' : 'bg-komuna-border-soft text-komuna-muted hover:bg-komuna-border' }}">Completed</a>
</div>

@if($campaigns->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Campaign</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tipe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Tanggal</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($campaigns as $campaign)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <a href="{{ route('brand.campaigns.show', $campaign) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-blue">{{ $campaign->title }}</a>
                                <p class="text-xs text-komuna-muted">{{ Str::limit($campaign->description, 60) ?? '-' }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $campaign->brand->name }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $campaign->campaign_type ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($campaign->status === 'active') bg-komuna-success-soft text-komuna-success
                                    @elseif($campaign->status === 'draft') bg-komuna-border-soft text-komuna-text
                                    @elseif($campaign->status === 'paused') bg-komuna-warning-soft text-komuna-warning
                                    @elseif($campaign->status === 'completed') bg-komuna-light text-komuna-blue
                                    @else bg-komuna-danger-soft text-komuna-danger
                                    @endif">
                                    {{ ucfirst($campaign->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">
                                {{ $campaign->start_date?->format('d M Y') ?? '-' }} - {{ $campaign->end_date?->format('d M Y') ?? '-' }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('brand.campaigns.show', $campaign) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a>
                                    <a href="{{ route('brand.campaigns.edit', $campaign) }}" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Edit</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $campaigns->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">📢</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Campaign</h3>
        <p class="text-komuna-muted text-sm mb-4">Buat campaign pertama Anda.</p>
        <a href="{{ route('brand.campaigns.create') }}" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Buat Campaign
        </a>
    </div>
@endif
@endsection
