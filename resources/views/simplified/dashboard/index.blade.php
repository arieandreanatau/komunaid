@extends('simplified.layouts.dashboard')
@section('title', 'Dashboard - KomunaID')
@section('content')
<h1 class="text-2xl font-bold text-gray-900 mb-1">Halo, {{ $user->name }} 👋</h1>
<p class="text-sm text-gray-600 mb-6">Kelola aktivitasmu, ajukan komunitas/brand/perusahaan, dan pantau status pengajuan.</p>

{{-- Pending submissions --}}
@if($pendingCommunities->count() || $pendingBrands->count() || $pendingCompanies->count())
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <h2 class="font-semibold text-yellow-900 mb-2">⏳ Pengajuan kamu sedang diproses</h2>
        <ul class="text-sm text-yellow-800 space-y-1">
            @foreach($pendingCommunities as $c)
                <li>Komunitas <strong>{{ $c->name }}</strong> — status: <strong>{{ str_replace('_',' ',$c->status) }}</strong></li>
            @endforeach
            @foreach($pendingBrands as $b)
                <li>Brand <strong>{{ $b->name }}</strong> — status: <strong>{{ str_replace('_',' ',$b->status) }}</strong></li>
            @endforeach
            @foreach($pendingCompanies as $c)
                <li>Perusahaan <strong>{{ $c->name }}</strong> — status: <strong>{{ str_replace('_',' ',$c->status) }}</strong></li>
            @endforeach
        </ul>
        <a href="{{ route('simplified.submissions.index') }}" class="text-sm text-yellow-900 underline mt-2 inline-block">Lihat semua pengajuan →</a>
    </div>
@endif

{{-- Approved entity cards --}}
@if($approvedCommunities->count() || $approvedBrands->count() || $approvedCompanies->count())
    <h2 class="text-lg font-semibold text-gray-900 mb-3">Kelola Entity</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        @foreach($approvedCommunities as $c)
            <div class="bg-white border border-indigo-200 rounded-xl p-4">
                <div class="text-xs text-indigo-600 font-semibold">KOMUNITAS</div>
                <h3 class="font-bold text-gray-900">{{ $c->name }}</h3>
                <p class="text-xs text-gray-500 mt-1">Disetujui {{ optional($c->approved_at)->format('d M Y') }}</p>
            </div>
        @endforeach
        @foreach($approvedBrands as $b)
            <div class="bg-white border border-pink-200 rounded-xl p-4">
                <div class="text-xs text-pink-600 font-semibold">BRAND</div>
                <h3 class="font-bold text-gray-900">{{ $b->name }}</h3>
                <p class="text-xs text-gray-500 mt-1">Disetujui {{ optional($b->approved_at)->format('d M Y') }}</p>
            </div>
        @endforeach
        @foreach($approvedCompanies as $c)
            <div class="bg-white border border-purple-200 rounded-xl p-4">
                <div class="text-xs text-purple-600 font-semibold">PERUSAHAAN</div>
                <h3 class="font-bold text-gray-900">{{ $c->name }}</h3>
                <p class="text-xs text-gray-500 mt-1">Disetujui {{ optional($c->approved_at)->format('d M Y') }}</p>
            </div>
        @endforeach
    </div>
@endif

{{-- Quick actions --}}
<h2 class="text-lg font-semibold text-gray-900 mb-3">Aksi Cepat</h2>
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <a href="{{ route('simplified.apply.community.create') }}" class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
        <div class="text-2xl mb-2">🤝</div>
        <h3 class="font-bold text-gray-900">Ajukan Komunitas</h3>
        <p class="text-sm text-gray-500 mt-1">Buat komunitas dan kelola anggota.</p>
    </a>
    <a href="{{ route('simplified.apply.brand.create') }}" class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
        <div class="text-2xl mb-2">🏷️</div>
        <h3 class="font-bold text-gray-900">Ajukan Brand</h3>
        <p class="text-sm text-gray-500 mt-1">Daftarkan brand dan campaign kamu.</p>
    </a>
    <a href="{{ route('simplified.apply.company.create') }}" class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
        <div class="text-2xl mb-2">🏢</div>
        <h3 class="font-bold text-gray-900">Ajukan Perusahaan</h3>
        <p class="text-sm text-gray-500 mt-1">Daftarkan perusahaan resmi.</p>
    </a>
</div>

{{-- Profile summary --}}
<div class="bg-white border border-gray-200 rounded-xl p-5">
    <h2 class="font-semibold text-gray-900 mb-3">Profil Saya</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-500">Nama:</span> <strong>{{ $user->name }}</strong></div>
        <div><span class="text-gray-500">Username:</span> <strong>{{ $user->username }}</strong></div>
        <div><span class="text-gray-500">Email:</span> <strong>{{ $user->email }}</strong></div>
        <div><span class="text-gray-500">Status:</span> <strong>{{ $user->status }}</strong></div>
        <div><span class="text-gray-500">Role:</span>
            <strong>
                @foreach($user->roles as $r)
                    <span class="inline-block bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{{ $r->name }}</span>
                @endforeach
            </strong>
        </div>
        <div><span class="text-gray-500">Login terakhir:</span> <strong>{{ optional($user->last_login_at)->diffForHumans() ?? '-' }}</strong></div>
    </div>
</div>

@if($isAdmin)
    <div class="mt-6 bg-gradient-to-r from-gray-900 to-indigo-900 text-white rounded-xl p-5">
        <h2 class="font-bold mb-2">🛡️ Admin Panel</h2>
        <p class="text-sm opacity-90 mb-3">Pengajuan tertunda: {{ $adminCounts['communities'] }} komunitas, {{ $adminCounts['brands'] }} brand, {{ $adminCounts['companies'] }} perusahaan.</p>
        <a href="{{ route('simplified.admin.approvals.index') }}" class="inline-block bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-semibold">Buka Approval Center →</a>
    </div>
@endif
@endsection
