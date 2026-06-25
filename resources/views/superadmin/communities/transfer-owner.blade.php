@extends('layouts.admin')

@php $pageTitle = 'Transfer Ownership - ' . $community->name @endphp

@section('content')
<div class="space-y-6 max-w-3xl">
    <div>
        <a href="{{ route('superadmin.communities.show', $community) }}" class="text-sm text-[#126BFF] hover:text-[#0B2D89] transition inline-flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Detail Komunitas
        </a>
        <h1 class="text-2xl font-bold text-[#0B2D89] mt-2">Transfer Ownership</h1>
        <p class="text-[#64748B] text-sm mt-1">{{ $community->name }}</p>
    </div>

    <div class="bg-[#F59E0B]/10 border border-[#F59E0B] rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        <div>
            <p class="text-sm font-semibold text-[#F59E0B]">Peringatan</p>
            <p class="text-sm text-[#64748B] mt-1">Anda akan mentransfer kepemilikan komunitas ini dari <strong class="text-[#0F172A]">{{ $community->owner->name }}</strong> ke user lain. Tindakan ini tidak dapat dibatalkan.</p>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6">
        <form method="POST" action="{{ route('superadmin.communities.transfer-owner', $community) }}">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-[#0F172A] mb-1">Owner Saat Ini</label>
                    <div class="px-4 py-2.5 bg-komuna-surface rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">{{ $community->owner->name }}</div>
                </div>
                <div>
                    <label for="new_owner_id" class="block text-sm font-medium text-[#0F172A] mb-1">Pilih Pemilik Baru</label>
                    <select name="new_owner_id" id="new_owner_id" required class="block w-full rounded-xl border-[#E2E8F0] shadow-sm focus:ring-[#126BFF] focus:border-[#126BFF] border px-4 py-2.5 text-sm">
                        <option value="">-- Pilih User --</option>
                        @foreach($users as $user)
                            <option value="{{ $user->id }}" {{ old('new_owner_id') == $user->id ? 'selected' : '' }}>{{ $user->name }} ({{ $user->email }})</option>
                        @endforeach
                    </select>
                    @error('new_owner_id')<p class="text-sm text-[#DC2626] mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label for="reason" class="block text-sm font-medium text-[#0F172A] mb-1">Alasan</label>
                    <textarea name="reason" id="reason" rows="3" required class="block w-full rounded-xl border-[#E2E8F0] shadow-sm focus:ring-[#126BFF] focus:border-[#126BFF] border px-4 py-2.5 text-sm" placeholder="Alasan transfer kepemilikan...">{{ old('reason') }}</textarea>
                    @error('reason')<p class="text-sm text-[#DC2626] mt-1">{{ $message }}</p>@enderror
                </div>
                <button type="submit" class="w-full bg-[#126BFF] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#0B2D89] transition text-sm shadow-sm" onclick="return confirm('Transfer kepemilikan komunitas ini?')">Transfer Kepemilikan</button>
            </div>
        </form>
    </div>
</div>
@endsection