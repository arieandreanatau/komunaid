@extends('simplified.layouts.dashboard')
@section('title', 'Detail Pengajuan')
@section('content')
<a href="{{ route('simplified.submissions.index') }}" class="text-sm text-indigo-600">← Kembali ke daftar</a>
@php
    $colors = ['pending_approval'=>'bg-yellow-100 text-yellow-800','need_revision'=>'bg-orange-100 text-orange-800','approved'=>'bg-green-100 text-green-800','rejected'=>'bg-red-100 text-red-800','suspended'=>'bg-gray-200 text-gray-800'];
    $typeLabels = ['community'=>'Komunitas','brand'=>'Brand','company'=>'Perusahaan'];
@endphp
<div class="bg-white border border-gray-200 rounded-xl p-6 mt-3">
    <h1 class="text-xl font-bold text-gray-900 mb-1">{{ $submission->name }}</h1>
    <p class="text-sm text-gray-500 mb-3">{{ $typeLabels[$type] ?? $type }}</p>
    <span class="px-2 py-1 rounded text-xs {{ $colors[$submission->status] ?? 'bg-gray-100' }}">{{ str_replace('_',' ',$submission->status) }}</span>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
        <div><span class="text-gray-500">Diajukan:</span> <strong>{{ optional($submission->submitted_at)->format('d M Y H:i') ?? '-' }}</strong></div>
        <div><span class="text-gray-500">Disetujui:</span> <strong>{{ optional($submission->approved_at)->format('d M Y H:i') ?? '-' }}</strong></div>
    </div>

    @if($submission->rejection_reason)
        <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <strong>Alasan Penolakan:</strong><br>{{ $submission->rejection_reason }}
        </div>
    @endif

    @if($submission->revision_notes)
        <div class="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
            <strong>Catatan Revisi:</strong><br>{{ $submission->revision_notes }}
        </div>
    @endif

    @if($submission->status === 'need_revision')
        <p class="text-sm text-gray-600 mt-4">Kamu bisa memperbaiki data dan submit ulang setelah perubahan.</p>
    @endif
</div>
@endsection
