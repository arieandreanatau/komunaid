@extends('layouts.app')

@section('content')
<div class="mb-8">
    <a href="{{ route('superadmin.audit-logs.index') }}" class="text-sm text-emerald-600 hover:text-emerald-800">&larr; Kembali ke Audit Logs</a>
    <h1 class="text-2xl font-bold text-gray-900 mt-2">Audit Log Detail</h1>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Log Info</h2>
        <dl class="space-y-3">
            <div>
                <dt class="text-sm text-gray-500">Timestamp</dt>
                <dd class="text-sm text-gray-900">{{ $auditLog->created_at->format('d M Y H:i:s') }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">User</dt>
                <dd class="text-sm text-gray-900">{{ $auditLog->user->name ?? 'System' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Action</dt>
                <dd>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        @if(str_contains($auditLog->action, 'approved') || str_contains($auditLog->action, 'confirmed')) bg-green-100 text-green-800
                        @elseif(str_contains($auditLog->action, 'rejected') || str_contains($auditLog->action, 'deleted')) bg-red-100 text-red-800
                        @else bg-blue-100 text-blue-800
                        @endif">
                        {{ $auditLog->action }}
                    </span>
                </dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">Description</dt>
                <dd class="text-sm text-gray-900">{{ $auditLog->description ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">IP Address</dt>
                <dd class="text-sm text-gray-900">{{ $auditLog->ip_address ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-sm text-gray-500">User Agent</dt>
                <dd class="text-sm text-gray-900 break-all">{{ $auditLog->user_agent ?? '-' }}</dd>
            </div>
            @if($auditLog->subject_type)
            <div>
                <dt class="text-sm text-gray-500">Subject</dt>
                <dd class="text-sm text-gray-900">{{ class_basename($auditLog->subject_type) }} #{{ $auditLog->subject_id }}</dd>
            </div>
            @endif
        </dl>
    </div>

    <div class="space-y-6">
        @if($auditLog->old_values)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Old Values</h3>
                <pre class="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 overflow-x-auto">{{ json_encode($auditLog->old_values, JSON_PRETTY_PRINT) }}</pre>
            </div>
        @endif

        @if($auditLog->new_values)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">New Values</h3>
                <pre class="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 overflow-x-auto">{{ json_encode($auditLog->new_values, JSON_PRETTY_PRINT) }}</pre>
            </div>
        @endif

        @if($subject)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Subject Detail</h3>
                <div class="text-sm text-gray-700">
                    @if($subject->exists)
                        <p><strong>Name/Title:</strong> {{ $subject->name ?? $subject->title ?? $subject->email ?? '-' }}</p>
                        @if(isset($subject->status))
                            <p><strong>Status:</strong> {{ $subject->status }}</p>
                        @endif
                    @else
                        <p class="text-gray-400">Subject sudah tidak ada di database.</p>
                    @endif
                </div>
            </div>
        @endif
    </div>
</div>
@endsection
