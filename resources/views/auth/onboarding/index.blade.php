@extends('layouts.guest')

@section('content')
<div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-komuna-text">Selamat Datang, {{ $user->name }}!</h2>
        <p class="text-komuna-muted mt-1">Kamu ingin menggunakan KomunaID sebagai apa?</p>
        <p class="text-komuna-light-text text-xs mt-2">Kamu sudah otomatis terdaftar sebagai Member.</p>
    </div>

    <div class="space-y-3">
        <div class="border border-komuna-border rounded-2xl p-5 hover:border-komuna-success hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-komuna-success-soft rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-komuna-success-soft">
                    <svg class="w-6 h-6 text-komuna-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div class="flex-1">
                    <h3 class="font-semibold text-komuna-text group-hover:text-komuna-success">Ajukan sebagai Community Owner</h3>
                    <p class="text-sm text-komuna-muted mt-1">Buat dan kelola komunitas, pengurus, volunteer, dan event komunitas.</p>
                </div>
            </div>
            <a href="{{ route('onboarding.role-request') }}?role=community_owner" class="mt-4 block text-center bg-komuna-success text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition text-sm">
                Ajukan sebagai Community Owner
            </a>
        </div>

        <div class="border border-komuna-border rounded-2xl p-5 hover:border-komuna-warning hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-komuna-warning-soft rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-komuna-warning-soft">
                    <svg class="w-6 h-6 text-komuna-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                    </svg>
                </div>
                <div class="flex-1">
                    <h3 class="font-semibold text-komuna-text group-hover:text-komuna-warning">Ajukan sebagai Brand Owner</h3>
                    <p class="text-sm text-komuna-muted mt-1">Kelola brand dan ajukan kolaborasi dengan komunitas.</p>
                </div>
            </div>
            <a href="{{ route('onboarding.role-request') }}?role=brand_owner" class="mt-4 block text-center bg-komuna-warning text-white py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition text-sm">
                Ajukan sebagai Brand Owner
            </a>
        </div>

        <div class="border border-komuna-border rounded-2xl p-5 hover:border-purple-500 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-komuna-info-soft">
                    <svg class="w-6 h-6 text-komuna-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div class="flex-1">
                    <h3 class="font-semibold text-komuna-text group-hover:text-komuna-info">Ajukan sebagai Company Owner</h3>
                    <p class="text-sm text-komuna-muted mt-1">Kelola perusahaan dan brand yang berada di bawah perusahaan.</p>
                </div>
            </div>
            <a href="{{ route('onboarding.role-request') }}?role=company_owner" class="mt-4 block text-center bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition text-sm">
                Ajukan sebagai Company Owner
            </a>
        </div>
    </div>

    <div class="mt-6 text-center">
        <a href="{{ route('member.dashboard') }}" class="inline-block bg-komuna-blue text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition text-sm">
            Nanti Saja &rarr;
        </a>
        <p class="text-xs text-komuna-light-text mt-2">Masuk sebagai Member dan menjelajahi KomunaID</p>
    </div>
</div>
@endsection
