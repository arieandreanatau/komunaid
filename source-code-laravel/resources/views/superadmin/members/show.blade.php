@extends('layouts.app')
@section('title', 'Detail Member')
@section('content')
<div class="max-w-4xl mx-auto px-4 py-8">
    <a href="{{ route('superadmin.members.index') }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Detail Member</h1>

    <div class="bg-white rounded-xl border p-6 mb-6">
        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="text-sm text-gray-400">Nama</label>
                <div class="font-medium">{{ $user->name }}</div>
            </div>
            <div>
                <label class="text-sm text-gray-400">Email</label>
                <div class="font-medium">{{ $user->email }}</div>
            </div>
            <div>
                <label class="text-sm text-gray-400">Full Name</label>
                <div class="font-medium">{{ $user->profile->full_name ?? '-' }}</div>
            </div>
            <div>
                <label class="text-sm text-gray-400">Telepon</label>
                <div class="font-medium">{{ $user->profile->phone ?? '-' }}</div>
            </div>
            <div>
                <label class="text-sm text-gray-400">Saldo Wallet</label>
                <div class="font-medium">Rp {{ number_format($user->wallet->balance ?? 0, 0, ',', '.') }}</div>
            </div>
            <div>
                <label class="text-sm text-gray-400">Role</label>
                <div class="font-medium">{{ $user->getRoleNames()->implode(', ') }}</div>
            </div>
        </div>
    </div>

    @if($user->memberCommunities->count())
        <div class="bg-white rounded-xl border p-6 mb-6">
            <h2 class="font-bold text-navy mb-3">Komunitas Diikuti</h2>
            <div class="space-y-2">
                @foreach($user->memberCommunities as $community)
                    <div class="flex items-center justify-between p-2 bg-soft-bg rounded">
                        <span class="text-sm font-medium">{{ $community->name }}</span>
                        <span class="text-xs px-2 py-1 {{ $community->pivot->status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' }} rounded">
                            {{ $community->pivot->status }}
                        </span>
                    </div>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection
