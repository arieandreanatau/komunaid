@extends('layouts.app')

@section('content')
<div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Role Request</h1>

    @php
        $hasPendingRequest = $roleRequests->where('status', 'pending')->count() > 0;
        $hasCommunityRole = auth()->user()->hasRole('community_owner');
        $hasBrandRole = auth()->user()->hasRole('brand_owner');
    @endphp

    @if(!$hasCommunityRole && !$hasBrandRole)
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Ajukan Role Baru</h2>

        <form method="POST" action="{{ route('member.role-request.store') }}">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Role</label>
                    <select name="requested_role" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border px-3 py-2">
                        <option value="">-- Pilih Role --</option>
                        @if(!$hasCommunityRole)
                            <option value="community_owner">Community Owner</option>
                        @endif
                        @if(!$hasBrandRole)
                            <option value="brand_owner">Brand Owner</option>
                        @endif
                    </select>
                    @error('requested_role')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">
                    Kirim Request
                </button>
            </div>
        </form>
    </div>
    @endif

    <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Riwayat Request</h2>

        @if($roleRequests->isEmpty())
            <p class="text-gray-500">Belum ada riwayat role request.</p>
        @else
            <div class="space-y-3">
                @foreach($roleRequests as $request)
                    <div class="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <p class="font-medium text-gray-900">{{ ucfirst(str_replace('_', ' ', $request->requested_role)) }}</p>
                            <p class="text-sm text-gray-500">{{ $request->created_at->format('d M Y H:i') }}</p>
                            @if($request->notes)
                                <p class="text-sm text-gray-600 mt-1">Catatan: {{ $request->notes }}</p>
                            @endif
                        </div>
                        <span class="px-3 py-1 rounded-full text-sm font-medium
                            @if($request->status === 'pending') bg-yellow-100 text-yellow-800
                            @elseif($request->status === 'approved') bg-green-100 text-green-800
                            @else bg-red-100 text-red-800
                            @endif">
                            {{ $request->status_label ?? ucfirst($request->status) }}
                        </span>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</div>
@endsection
