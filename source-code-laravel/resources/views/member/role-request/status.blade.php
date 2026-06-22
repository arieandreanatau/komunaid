@extends('layouts.app')
@section('title', 'Status Pengajuan Role')
@section('content')
<div class="max-w-4xl mx-auto px-4 py-8">
    <a href="{{ route('member.role-request.create') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Status Pengajuan Role</h1>
    <div class="space-y-4">
        @forelse($requests as $req)
            <div class="bg-white rounded-xl border p-4">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-bold text-navy">{{ ucfirst(str_replace('_', ' ', $req->requested_role)) }}</div>
                        <div class="text-sm text-gray-500 mt-1">{{ $req->reason }}</div>
                        <div class="text-xs text-gray-400 mt-1">Diajukan: {{ $req->created_at->format('d M Y H:i') }}</div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded
                        {{ $req->status === 'approved' ? 'bg-green-100 text-green-700' : ($req->status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') }}">
                        {{ ucfirst($req->status) }}
                    </span>
                </div>
            </div>
        @empty
            <div class="text-center py-12 text-gray-400">Belum ada pengajuan.</div>
        @endforelse
    </div>
</div>
@endsection
