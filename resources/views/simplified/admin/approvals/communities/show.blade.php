@extends('simplified.layouts.dashboard')
@section('title', 'Detail Komunitas')
@section('content')
<a href="{{ route('simplified.admin.approvals.communities.index') }}" class="text-sm text-indigo-600">← Kembali</a>
<div class="bg-white border border-gray-200 rounded-xl p-6 mt-3">
    <h1 class="text-xl font-bold text-gray-900 mb-1">{{ $community->name }}</h1>
    <p class="text-sm text-gray-500 mb-3">Pemilik: {{ optional($community->owner)->name }} ({{ optional($community->owner)->email }})</p>
    <span class="px-2 py-1 rounded text-xs bg-gray-100">{{ str_replace('_',' ',$community->status) }}</span>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
        <div><span class="text-gray-500">Kategori:</span> {{ optional($community->category)->name ?? '-' }}</div>
        <div><span class="text-gray-500">Diajukan:</span> {{ optional($community->submitted_at)->format('d M Y H:i') ?? '-' }}</div>
        <div class="md:col-span-2"><span class="text-gray-500">Deskripsi:</span><br>{{ $community->description }}</div>
    </div>

    @if($community->rejection_reason)
        <div class="mt-3 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800"><strong>Alasan Penolakan:</strong> {{ $community->rejection_reason }}</div>
    @endif
    @if($community->revision_notes)
        <div class="mt-3 bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800"><strong>Catatan Revisi:</strong> {{ $community->revision_notes }}</div>
    @endif

    <div class="border-t mt-5 pt-5 space-y-3">
        <form method="POST" action="{{ route('simplified.admin.approvals.communities.approve', $community->id) }}">@csrf<button class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">✅ Approve</button></form>
        <form method="POST" action="{{ route('simplified.admin.approvals.communities.revision', $community->id) }}" class="flex gap-2 items-start">
            @csrf
            <textarea name="revision_notes" required minlength="5" rows="2" placeholder="Catatan revisi..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
            <button class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">✏️ Request Revision</button>
        </form>
        <form method="POST" action="{{ route('simplified.admin.approvals.communities.reject', $community->id) }}" class="flex gap-2 items-start">
            @csrf
            <textarea name="rejection_reason" required minlength="5" rows="2" placeholder="Alasan penolakan..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
            <button class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">❌ Reject</button>
        </form>
        <form method="POST" action="{{ route('simplified.admin.approvals.communities.suspend', $community->id) }}">@csrf<button class="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">⏸ Suspend</button></form>
    </div>
</div>
@endsection
