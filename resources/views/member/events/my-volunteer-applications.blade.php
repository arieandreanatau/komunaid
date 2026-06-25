@extends('layouts.dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Aplikasi Volunteer Saya</h1>
    <p class="text-komuna-muted">Daftar aplikasi volunteer yang telah Anda kirim.</p>
</div>

@if($applications->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Event</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Campaign</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Posisi</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Applied</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Reviewed</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($applications as $app)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <a href="{{ route('events.show', $app->event) }}" class="font-semibold text-komuna-success hover:text-komuna-success text-sm">{{ $app->event->title }}</a>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $app->campaign->title ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $app->position_applied ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($app->status === 'approved') bg-komuna-success-soft text-komuna-success
                                    @elseif($app->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                    @else bg-komuna-danger-soft text-komuna-danger
                                    @endif">
                                    {{ ucfirst($app->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $app->created_at->format('d M Y H:i') }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $app->reviewed_at ? $app->reviewed_at->format('d M Y H:i') : '-' }}</td>
                        </tr>
                        @if($app->status === 'rejected' && $app->rejection_reason)
                            <tr class="bg-komuna-danger-soft">
                                <td colspan="6" class="px-6 py-3">
                                    <p class="text-xs text-komuna-danger font-medium">Alasan Penolakan: <span class="font-normal text-komuna-danger">{{ $app->rejection_reason }}</span></p>
                                </td>
                            </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $applications->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">&#x1F64B;</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Aplikasi</h3>
        <p class="text-komuna-muted text-sm">Anda belum mengirim aplikasi volunteer.</p>
    </div>
@endif
@endsection
