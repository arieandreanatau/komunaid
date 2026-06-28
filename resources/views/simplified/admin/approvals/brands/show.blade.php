@extends('simplified.layouts.dashboard')
@section('title', 'Detail Brand')
@section('content')
<a href="{{ route('simplified.admin.approvals.brands.index') }}" class="text-sm text-indigo-600">← Kembali</a>
<div class="bg-white border border-gray-200 rounded-xl p-6 mt-3">
    <h1 class="text-xl font-bold text-gray-900 mb-1">{{ $brand->name }}</h1>
    <p class="text-sm text-gray-500 mb-3">Pemilik: {{ optional($brand->owner)->name }} ({{ optional($brand->owner)->email }})</p>
    <span class="px-2 py-1 rounded text-xs bg-gray-100">{{ str_replace('_',' ',$brand->status) }}</span>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
        <div><span class="text-gray-500">Industri:</span> {{ $brand->industry ?? '-' }}</div>
        <div><span class="text-gray-500">Website:</span> {{ $brand->website ?? $brand->website_url ?? '-' }}</div>
        <div class="md:col-span-2"><span class="text-gray-500">Deskripsi:</span><br>{{ $brand->description }}</div>
    </div>

    @if($brand->rejection_reason)<div class="mt-3 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800"><strong>Alasan Penolakan:</strong> {{ $brand->rejection_reason }}</div>@endif
    @if($brand->revision_notes)<div class="mt-3 bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800"><strong>Catatan Revisi:</strong> {{ $brand->revision_notes }}</div>@endif

    <div class="border-t mt-5 pt-5 space-y-3">
        <form method="POST" action="{{ route('simplified.admin.approvals.brands.approve', $brand->id) }}">@csrf<button class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">✅ Approve</button></form>
        <form method="POST" action="{{ route('simplified.admin.approvals.brands.revision', $brand->id) }}" class="flex gap-2 items-start">
            @csrf
            <textarea name="revision_notes" required minlength="5" rows="2" placeholder="Catatan revisi..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
            <button class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">✏️ Request Revision</button>
        </form>
        <form method="POST" action="{{ route('simplified.admin.approvals.brands.reject', $brand->id) }}" class="flex gap-2 items-start">
            @csrf
            <textarea name="rejection_reason" required minlength="5" rows="2" placeholder="Alasan penolakan..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
            <button class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">❌ Reject</button>
        </form>
        <form method="POST" action="{{ route('simplified.admin.approvals.brands.suspend', $brand->id) }}">@csrf<button class="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">⏸ Suspend</button></form>
    </div>
</div>
@endsection
