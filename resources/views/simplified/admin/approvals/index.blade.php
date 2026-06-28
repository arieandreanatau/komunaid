@extends('simplified.layouts.dashboard')
@section('title', 'Approval Center')
@section('content')
<h1 class="text-2xl font-bold text-gray-900 mb-1">🛡️ Approval Center</h1>
<p class="text-sm text-gray-600 mb-6">Pilih jenis entity untuk memulai review.</p>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <a href="{{ route('simplified.admin.approvals.communities.index') }}" class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md">
        <div class="text-2xl mb-2">🤝</div>
        <h3 class="font-bold">Komunitas</h3>
        <p class="text-sm text-gray-500 mt-1">Review pengajuan komunitas.</p>
    </a>
    <a href="{{ route('simplified.admin.approvals.brands.index') }}" class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md">
        <div class="text-2xl mb-2">🏷️</div>
        <h3 class="font-bold">Brand</h3>
        <p class="text-sm text-gray-500 mt-1">Review pengajuan brand.</p>
    </a>
    <a href="{{ route('simplified.admin.approvals.companies.index') }}" class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md">
        <div class="text-2xl mb-2">🏢</div>
        <h3 class="font-bold">Perusahaan</h3>
        <p class="text-sm text-gray-500 mt-1">Review pengajuan perusahaan.</p>
    </a>
</div>
@endsection
