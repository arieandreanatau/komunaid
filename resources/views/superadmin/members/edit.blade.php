@extends('layouts.admin')

@php $pageTitle = 'Edit Member' @endphp

@section('content')
<div class="mb-6">
    <a href="{{ route("superadmin.members.index") }}" class="inline-flex items-center gap-1 text-sm text-[#126BFF] hover:underline mb-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali ke Members
    </a>
    <h1 class="text-2xl font-bold text-[#0B2D89]">Edit Member</h1>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 max-w-2xl">
    @if($errors->any())
        <div class="mb-4 bg-[#DC2626]/10 border border-[#DC2626] text-[#DC2626] px-4 py-3 rounded-lg text-sm">
            <ul class="list-disc list-inside">@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
        </div>
    @endif

    <form method="POST" action="{{ route("superadmin.members.update", $user) }}">
        @csrf
        @method("PUT")

        <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-[#64748B] mb-1">Name</label>
            <input type="text" name="name" id="name" value="{{ old("name", $user->name) }}" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none" required>
            @error("name")<p class="text-xs text-[#DC2626] mt-1">{{ $message }}</p>@enderror
        </div>

        <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-[#64748B] mb-1">Username</label>
            <input type="text" name="username" id="username" value="{{ old("username", $user->username) }}" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none" required>
            @error("username")<p class="text-xs text-[#DC2626] mt-1">{{ $message }}</p>@enderror
        </div>

        <div class="mb-6">
            <label for="email" class="block text-sm font-medium text-[#64748B] mb-1">Email</label>
            <input type="email" name="email" id="email" value="{{ old("email", $user->email) }}" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none" required>
            @error("email")<p class="text-xs text-[#DC2626] mt-1">{{ $message }}</p>@enderror
        </div>

        <div class="flex items-center gap-3">
            <button type="submit" class="px-6 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">Save</button>
            <a href="{{ route("superadmin.members.index") }}" class="px-6 py-2 bg-komuna-border-soft text-[#64748B] text-sm font-medium rounded-lg hover:bg-komuna-border transition">Cancel</a>
        </div>
    </form>
</div>
@endsection
