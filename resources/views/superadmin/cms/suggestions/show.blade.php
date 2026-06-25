@extends('layouts.admin')

@section('content')
<div class="max-w-2xl">
    <a href="{{ route('superadmin.cms.suggestions.index') }}" class="inline-flex items-center gap-1 text-sm text-komuna-blue hover:text-komuna-navy mb-4 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>

    <div class="bg-white rounded-2xl border border-komuna-border-soft p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-komuna-text">{{ $suggestion->subject ?? 'Saran' }}</h2>
            @php
                $statusColors = ['new' => 'bg-blue-100 text-blue-700', 'reviewed' => 'bg-green-100 text-green-700', 'replied' => 'bg-purple-100 text-purple-700', 'archived' => 'bg-komuna-border-soft text-komuna-muted'];
            @endphp
            <span class="text-xs px-2.5 py-1 rounded-full {{ $statusColors[$suggestion->status] ?? 'bg-komuna-border-soft' }}">{{ $suggestion->status }}</span>
        </div>

        <div class="space-y-3 text-sm border-b border-komuna-border-soft pb-4 mb-4">
            <div><span class="text-komuna-muted">Nama:</span> <span class="text-komuna-text">{{ $suggestion->name ?? '-' }}</span></div>
            <div><span class="text-komuna-muted">Email:</span> <span class="text-komuna-text">{{ $suggestion->email ?? '-' }}</span></div>
            <div><span class="text-komuna-muted">User:</span> <span class="text-komuna-text">{{ $suggestion->user->name ?? 'Guest' }}</span></div>
            <div><span class="text-komuna-muted">Tanggal:</span> <span class="text-komuna-text">{{ $suggestion->created_at->format('d M Y H:i') }}</span></div>
        </div>

        <div class="prose prose-sm max-w-none">
            <p>{{ $suggestion->message }}</p>
        </div>

        @if($suggestion->reviewed_at)
            <div class="mt-4 pt-4 border-t border-komuna-border-soft text-sm text-komuna-muted">
                Ditinjau oleh {{ $suggestion->reviewer->name ?? '-' }} pada {{ $suggestion->reviewed_at->format('d M Y H:i') }}
            </div>
        @endif

        @if($suggestion->response_note)
            <div class="mt-4 p-4 bg-komuna-light rounded-xl text-sm">
                <strong>Catatan:</strong> {{ $suggestion->response_note }}
            </div>
        @endif
    </div>

    <div class="flex gap-3">
        @if($suggestion->status !== 'reviewed')
            <form action="{{ route('superadmin.cms.suggestions.mark-reviewed', $suggestion) }}" method="POST">
                @csrf
                <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition">
                    Tandai Ditinjau
                </button>
            </form>
        @endif
        @if($suggestion->status !== 'archived')
            <form action="{{ route('superadmin.cms.suggestions.archive', $suggestion) }}" method="POST">
                @csrf
                <button type="submit" class="bg-komuna-muted text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy-dark transition">
                    Arsipkan
                </button>
            </form>
        @endif
    </div>
</div>
@endsection
