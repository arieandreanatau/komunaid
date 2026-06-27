@extends('layouts.member')

@section('title', 'Premium Demo')

@section('content')
<div class="max-w-3xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-4">Premium Feature Demo</h1>

    @php
        $premium = app(\App\Services\Premium\PremiumAccessService::class);
    @endphp

    <div class="bg-white shadow rounded-lg p-6 mb-4">
        <h2 class="text-lg font-semibold mb-2">Status Akun</h2>
        <ul class="text-sm space-y-1">
            <li>User: <strong>{{ auth()->user()->name }}</strong></li>
            <li>Role: <strong>{{ auth()->user()->getRoleNames()->implode(', ') ?: '—' }}</strong></li>
            <li>Status: <strong>{{ auth()->user()->status }}</strong></li>
        </ul>
    </div>

    <div class="bg-white shadow rounded-lg p-6 mb-4">
        <h2 class="text-lg font-semibold mb-2">Feature Access</h2>
        <table class="min-w-full text-sm">
            <thead>
                <tr class="border-b">
                    <th class="text-left py-2">Feature</th>
                    <th class="text-left py-2">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach(\App\Support\Enums\FeatureKeyEnum::cases() as $feature)
                    @php $locked = $premium->isLockedByEnum(auth()->user(), $feature); @endphp
                    <tr class="border-b">
                        <td class="py-2">{{ $feature->value }}</td>
                        <td class="py-2">
                            @if($locked)
                                <span class="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">LOCKED</span>
                            @else
                                <span class="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">UNLOCKED</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <p class="text-xs text-gray-500">
        <em>Superadmin dan admin_platform otomatis bypass semua premium locks.</em>
    </p>
</div>
@endsection
