@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Kampanye Volunteer</h1>
        <p class="text-komuna-muted">{{ $event->title }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
        <a href="{{ route('community.events.volunteer-campaign.create', $event) }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">+ Buat Kampanye</a>
    </div>
</div>
@if($campaigns->count() > 0)
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @foreach($campaigns as $campaign)
            <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="font-semibold text-komuna-text">{{ $campaign->title }}</h3>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if($campaign->status === 'active') bg-komuna-success-soft text-komuna-success
                        @elseif($campaign->status === 'closed') bg-komuna-danger-soft text-komuna-danger
                        @else bg-komuna-border-soft text-komuna-text @endif">
                        {{ ucfirst($campaign->status) }}
                    </span>
                </div>
                <p class="text-sm text-komuna-muted mb-3">{{ Str::limit($campaign->description, 100) }}</p>
                <div class="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div><span class="text-komuna-muted">Quota:</span> <span class="font-medium">{{ $campaign->quota }}</span></div>
                    <div><span class="text-komuna-muted">Applications:</span> <span class="font-medium">{{ $campaign->applications_count ?? $campaign->applications->count() ?? 0 }}</span></div>
                    <div><span class="text-komuna-muted">Start:</span> <span class="font-medium">{{ $campaign->start_date->format('d M Y') }}</span></div>
                    <div><span class="text-komuna-muted">End:</span> <span class="font-medium">{{ $campaign->end_date->format('d M Y') }}</span></div>
                </div>
                <div class="flex items-center gap-2 pt-3 border-t border-komuna-border-soft">
                    <form action="{{ route('community.events.volunteer-campaign.toggle', [$event, $campaign]) }}" method="POST" class="inline">@csrf
                        <button type="submit" class="px-3 py-1 rounded-lg text-xs font-medium {{ $campaign->status === 'active' ? 'bg-komuna-danger-soft text-komuna-danger hover:bg-red-200' : 'bg-komuna-success-soft text-komuna-success hover:bg-emerald-200' }} transition">
                            {{ $campaign->status === 'active' ? 'Tutup' : 'Buka' }}
                        </button>
                    </form>
                    <a href="{{ route('community.events.volunteer-campaign.edit', [$event, $campaign]) }}" class="px-3 py-1 rounded-lg text-xs font-medium bg-komuna-light text-komuna-blue hover:bg-blue-200 transition">Edit</a>
                    <form action="{{ route('community.events.volunteer-campaign.destroy', [$event, $campaign]) }}" method="POST" class="inline" onsubmit="return confirm('Hapus kampanye ini?')">@csrf@method('DELETE')
                        <button type="submit" class="px-3 py-1 rounded-lg text-xs font-medium bg-komuna-danger-soft text-komuna-danger hover:bg-red-200 transition">Hapus</button>
                    </form>
                </div>
            </div>
        @endforeach
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Kampanye</h3>
        <p class="text-komuna-muted text-sm mb-4">Buat kampanye volunteer pertama.</p>
        <a href="{{ route('community.events.volunteer-campaign.create', $event) }}" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Buat Kampanye</a>
    </div>
@endif
@endsection