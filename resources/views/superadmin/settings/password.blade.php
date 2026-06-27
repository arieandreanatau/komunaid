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

    <div class="bg-white rounded-xl border border-[#FCD34D] shadow-sm overflow-hidden mt-6">
        <div class="px-6 py-5 border-b border-[#FCD34D] bg-[#FFFBEB]">
            <h2 class="text-lg font-semibold text-[#92400E]">Reset Demo Account Passwords</h2>
            <p class="text-sm text-[#78350F] mt-1">Resets the password of all 8 seeded demo accounts (superadmin, member, community/brand/company owner, banned, suspended) to the value you enter. Use this after a fresh DB seed to re-enable demo logins. Action is recorded in audit log.</p>
        </div>
        <form action="{{ route('superadmin.settings.reset-demo-passwords') }}" method="POST" class="p-6 space-y-4"
            onsubmit="return confirm('Reset password for all 8 demo accounts?');">
            @csrf
            <div>
                <label for="demo_password" class="block text-sm font-medium text-[#0F172A] mb-1.5">New demo password (applies to all 8 accounts)</label>
                <input type="text" name="password" id="demo_password"
                    class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition"
                    required minlength="4" maxlength="255" placeholder="e.g. password">
                @error('password')
                    <p class="mt-1 text-xs text-[#DC2626]">{{ $message }}</p>
                @enderror
            </div>
            <div class="flex justify-end pt-2">
                <button type="submit"
                    class="px-6 py-2.5 bg-[#F59E0B] hover:bg-[#B45309] text-white text-sm font-semibold rounded-lg transition shadow-sm">
                    Reset Demo Passwords
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
