@extends('layouts.app')
@section('title', 'Ajukan Role')
@section('content')
<div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-navy mb-6">Ajukan Role</h1>
    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{{ session('error') }}</div>
    @endif
    @if($existingRequest)
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 class="font-bold text-yellow-700">Pengajuan Sedang Diproses</h3>
            <p class="text-sm text-yellow-600 mt-1">Anda sudah memiliki pengajuan role yang sedang menunggu review.</p>
            <div class="mt-3 text-sm">
                <div>Role: <strong>{{ ucfirst(str_replace('_', ' ', $existingRequest->requested_role)) }}</strong></div>
                <div>Status: <span class="text-yellow-700 font-medium">Pending</span></div>
            </div>
        </div>
    @else
        <div class="bg-white rounded-xl border p-6">
            <form action="{{ route('member.role-request.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Role yang Diminta *</label>
                    <select name="requested_role" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue">
                        <option value="community_owner">Community Owner</option>
                        <option value="brand_owner">Brand Owner</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Alasan *</label>
                    <textarea name="reason" rows="4" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue" placeholder="Jelaskan alasan Anda mengajukan role ini...">{{ old('reason') }}</textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Bukti Pendukung (opsional)</label>
                    <input type="file" name="evidence" accept=".pdf,.jpg,.png" class="w-full px-4 py-2 border rounded-lg">
                    <p class="text-xs text-gray-400 mt-1">PDF, JPG, atau PNG. Max 5MB.</p>
                </div>
                <button type="submit" class="bg-blue hover:bg-navy text-white px-6 py-2 rounded-lg transition">Kirim Pengajuan</button>
            </form>
        </div>
    @endif
</div>
@endsection
