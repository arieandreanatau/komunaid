@extends('layouts.admin')

@php $pageTitle = 'Profile Settings' @endphp

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-[#E2E8F0]">
            <h2 class="text-lg font-semibold text-[#0B2D89]">Profile Settings</h2>
            <p class="text-sm text-[#64748B] mt-1">Update your account information.</p>
        </div>

        <form action="{{ route('superadmin.settings.profile.update') }}" method="POST" class="p-6 space-y-5">
            @csrf
            @method('PUT')

            <div>
                <label for="name" class="block text-sm font-medium text-[#0F172A] mb-1.5">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name', $user->name) }}"
                    class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                    required>
                @error('name')
                    <p class="mt-1 text-xs text-[#DC2626]">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="username" class="block text-sm font-medium text-[#0F172A] mb-1.5">Username</label>
                <input type="text" name="username" id="username" value="{{ old('username', $user->username) }}"
                    class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                    required>
                @error('username')
                    <p class="mt-1 text-xs text-[#DC2626]">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                <input type="email" name="email" id="email" value="{{ old('email', $user->email) }}"
                    class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                    required>
                @error('email')
                    <p class="mt-1 text-xs text-[#DC2626]">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex justify-end pt-2">
                <button type="submit"
                    class="px-6 py-2.5 bg-[#126BFF] hover:bg-[#0B2D89] text-white text-sm font-semibold rounded-lg transition shadow-sm">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
