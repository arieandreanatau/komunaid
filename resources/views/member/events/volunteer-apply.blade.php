@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <a href="{{ route('events.show', $event) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">&larr; Kembali ke Event</a>
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text mt-2">Apply Volunteer</h1>
    <p class="text-komuna-muted">{{ $event->title }} &mdash; {{ $event->community->name }}</p>
</div>

<div class="max-w-2xl">
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
        <form action="{{ route('member.events.volunteer.store', $event) }}" method="POST" class="space-y-5">
            @csrf

            @if(isset($campaigns) && $campaigns->count() > 0 && $campaigns->count() > 1)
                <div>
                    <label for="event_volunteer_campaign_id" class="block text-sm font-medium text-komuna-text mb-1">Pilih Campaign</label>
                    <select name="event_volunteer_campaign_id" id="event_volunteer_campaign_id" required class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue">
                        <option value="">-- Pilih Campaign --</option>
                        @foreach($campaigns as $campaign)
                            <option value="{{ $campaign->id }}" {{ old('event_volunteer_campaign_id') == $campaign->id ? 'selected' : '' }}>
                                {{ $campaign->title }}{{ $campaign->required_count ? ' (' . $campaign->required_count . ' orang dibutuhkan)' : '' }}
                            </option>
                        @endforeach
                    </select>
                    @error('event_volunteer_campaign_id')<p class="text-xs text-komuna-danger mt-1">{{ $message }}</p>@enderror
                </div>
            @elseif(isset($campaigns) && $campaigns->count() === 1)
                <input type="hidden" name="event_volunteer_campaign_id" value="{{ $campaigns->first()->id }}">
                <div class="bg-komuna-surface rounded-lg p-4">
                    <p class="text-sm font-medium text-komuna-text">{{ $campaigns->first()->title }}</p>
                    @if($campaigns->first()->description)
                        <p class="text-xs text-komuna-muted mt-1">{{ $campaigns->first()->description }}</p>
                    @endif
                </div>
            @endif

            <div>
                <label for="position_applied" class="block text-sm font-medium text-komuna-text mb-1">Posisi yang Dilamar</label>
                <input type="text" name="position_applied" id="position_applied" value="{{ old('position_applied') }}" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Contoh: Koordinator Lapangan, Registrasi, dll.">
                @error('position_applied')<p class="text-xs text-komuna-danger mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label for="motivation" class="block text-sm font-medium text-komuna-text mb-1">Motivasi</label>
                <textarea name="motivation" id="motivation" rows="4" required
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Ceritakan motivasi Anda untuk menjadi volunteer...">{{ old('motivation') }}</textarea>
                @error('motivation')<p class="text-xs text-komuna-danger mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label for="answers" class="block text-sm font-medium text-komuna-text mb-1">Jawaban Tambahan</label>
                <textarea name="answers" id="answers" rows="3"
                    class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                    placeholder="Pengalaman terkait, ketersediaan waktu, dll. (opsional)">{{ old('answers') }}</textarea>
                @error('answers')<p class="text-xs text-komuna-danger mt-1">{{ $message }}</p>@enderror
            </div>

            <button type="submit" class="w-full bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                Kirim Aplikasi
            </button>
        </form>
    </div>
</div>
@endsection
