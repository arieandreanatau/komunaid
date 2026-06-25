@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Detail Lamaran</h1>
        <p class="text-komuna-muted">{{ $application->user->name ?? '-' }}</p>
    </div>
    <a href="{{ route('community.events.volunteer-applications.index', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6">
            <h2 class="text-lg font-semibold text-komuna-text mb-4">Applicant Info</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><p class="text-xs text-komuna-muted">Name</p><p class="text-sm font-medium text-komuna-text">{{ $application->user->name ?? '-' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Email</p><p class="text-sm font-medium text-komuna-text">{{ $application->user->email ?? '-' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Position</p><p class="text-sm font-medium text-komuna-text">{{ $application->position ?? '-' }}</p></div>
                <div><p class="text-xs text-komuna-muted">Status</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium @if($application->status === 'accepted') bg-komuna-success-soft text-komuna-success @elseif($application->status === 'rejected') bg-komuna-danger-soft text-komuna-danger @else bg-komuna-warning-soft text-komuna-warning @endif">{{ ucfirst($application->status) }}</span>
                </div>
                <div><p class="text-xs text-komuna-muted">Applied At</p><p class="text-sm font-medium text-komuna-text">{{ $application->created_at->format('d M Y H:i') }}</p></div>
                <div><p class="text-xs text-komuna-muted">Reviewed At</p><p class="text-sm font-medium text-komuna-text">{{ $application->reviewed_at ? $application->reviewed_at->format('d M Y H:i') : '-' }}</p></div>
            </div>
            @if($application->motivation)
                <div class="mt-6"><p class="text-xs text-komuna-muted mb-1">Motivation</p><p class="text-sm text-komuna-text">{{ $application->motivation }}</p></div>
            @endif
            @if($application->answers)
                <div class="mt-4"><p class="text-xs text-komuna-muted mb-1">Answers</p><p class="text-sm text-komuna-text">{{ is_array($application->answers) ? json_encode($application->answers, JSON_PRETTY_PRINT) : $application->answers }}</p></div>
            @endif
        </div>
    </div>
    <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-5">
            <h3 class="font-semibold text-komuna-text mb-3">Actions</h3>
            @if($application->status === 'pending')
                <form action="{{ route('community.events.volunteer-applications.accept', [$event, $application]) }}" method="POST" class="mb-3">@csrf<button type="submit" class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Accept</button></form>
                <form action="{{ route('community.events.volunteer-applications.reject', [$event, $application]) }}" method="POST">@csrf
                    <label class="block text-sm font-medium text-komuna-text mb-1">Alasan Penolakan</label>
                    <textarea name="reason" rows="3" class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue mb-2"></textarea>
                    <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Reject</button>
                </form>
            @else
                <p class="text-sm text-komuna-muted">Lamaran sudah {{ $application->status }}.</p>
            @endif
        </div>
    </div>
</div>
@endsection