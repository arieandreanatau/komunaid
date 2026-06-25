@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Lamaran Volunteer</h1>
        <p class="text-komuna-muted">{{ $event->title }}</p>
    </div>
    <a href="{{ route('community.events.show', $event) }}" class="bg-komuna-border-soft text-komuna-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-komuna-border transition">Kembali</a>
</div>
@if($applications->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Applicant</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Position</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Applied At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Reviewed At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($applications as $app)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4 text-sm font-medium text-komuna-text">{{ $app->user->name ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $app->position ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($app->status === 'accepted') bg-komuna-success-soft text-komuna-success
                                    @elseif($app->status === 'rejected') bg-komuna-danger-soft text-komuna-danger
                                    @else bg-komuna-warning-soft text-komuna-warning @endif">
                                    {{ ucfirst($app->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $app->created_at->format('d M Y H:i') }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $app->reviewed_at ? $app->reviewed_at->format('d M Y H:i') : '-' }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('community.events.volunteer-applications.show', [$event, $app]) }}" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Detail</a>
                                    @if($app->status === 'pending')
                                        <form action="{{ route('community.events.volunteer-applications.accept', [$event, $app]) }}" method="POST" class="inline">@csrf<button type="submit" class="text-komuna-success hover:text-komuna-success text-sm font-medium">Accept</button></form>
                                        <form action="{{ route('community.events.volunteer-applications.reject', [$event, $app]) }}" method="POST" class="inline">@csrf<button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium" onclick="event.preventDefault();this.closest('form').querySelector('.reason-field').classList.toggle('hidden')">Reject</button>
                                            <div class="reason-field hidden mt-2"><textarea name="reason" rows="2" class="border border-komuna-border rounded-lg px-3 py-1.5 text-sm" placeholder="Alasan penolakan"></textarea><button type="submit" class="ml-2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs">Kirim</button></div>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $applications->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Lamaran</h3>
        <p class="text-komuna-muted text-sm">Lamaran volunteer belum masuk.</p>
    </div>
@endif
@endsection