@extends('layouts.admin')

@php $pageTitle = 'Change Password' @endphp

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-[#E2E8F0]">
            <h2 class="text-lg font-semibold text-[#0B2D89]">Change Password</h2>
            <p class="text-sm text-[#64748B] mt-1">Ensure your account remains secure with a strong password.</p>
        </div>

        <form action="{{ route('superadmin.settings.password.update') }}" method="POST" class="p-6 space-y-5">
            @csrf
            @method('PUT')

            <div>
                <label for="current_password" class="block text-sm font-medium text-[#0F172A] mb-1.5">Current Password</label>
                <input type="password" name="current_password" id="current_password"
                    class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                    required>
                @error('current_password')
                    <p class="mt-1 text-xs text-[#DC2626]">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-[#0F172A] mb-1.5">New Password</label>
                <input type="password" name="password" id="password"
                    class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                    required>
                @error('password')
                    <p class="mt-1 text-xs text-[#DC2626]">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-[#0F172A] mb-1.5">Confirm New Password</label>
                <input type="password" name="password_confirmation" id="password_confirmation"
                    class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                    required>
            </div>

            <div class="flex justify-end pt-2">
                <button type="submit"
                    class="px-6 py-2.5 bg-[#126BFF] hover:bg-[#0B2D89] text-white text-sm font-semibold rounded-lg transition shadow-sm">
                    Update Password
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
