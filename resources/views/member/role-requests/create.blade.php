@extends('layouts.dashboard')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="mb-6">
        <a href="{{ route('member.role-requests.index') }}" class="text-sm text-[#126BFF] hover:text-[#0B2D89]">
            &larr; Kembali ke Role Request
        </a>
        <h1 class="text-2xl font-bold text-[#0F172A] mt-2">Ajukan Role Baru</h1>
        <p class="text-[#64748B] text-sm mt-1">Pilih role yang ingin kamu ajukan</p>
    </div>

    @if($errors->any())
        <div class="mb-4 bg-komuna-danger-soft border border-red-400 text-komuna-danger px-4 py-3 rounded-xl text-sm">
            <ul class="list-disc list-inside">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if($availableRoles->isEmpty())
        <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 text-center">
            <p class="text-[#64748B]">Anda sudah mengajukan semua role yang tersedia atau sudah memiliki role tersebut.</p>
        </div>
    @else
        <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
            <form method="POST" action="{{ route('member.role-requests.store') }}">
                @csrf
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-[#0F172A] mb-3">Pilih Role</label>
                        <div class="space-y-3">
                            @if($availableRoles->contains('community_owner'))
                                <label class="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#16A34A] hover:bg-komuna-success-soft/50 transition has-[:checked]:border-[#16A34A] has-[:checked]:bg-komuna-success-soft">
                                    <input type="radio" name="requested_role" value="community_owner" {{ old('requested_role') === 'community_owner' ? 'checked' : '' }} class="text-[#16A34A] focus:ring-[#16A34A]">
                                    <div>
                                        <p class="font-semibold text-[#0F172A] text-sm">Community Owner</p>
                                        <p class="text-xs text-[#64748B]">Buat dan kelola komunitas</p>
                                    </div>
                                </label>
                            @endif
                            @if($availableRoles->contains('brand_owner'))
                                <label class="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#F59E0B] hover:bg-amber-50/50 transition has-[:checked]:border-[#F59E0B] has-[:checked]:bg-amber-50">
                                    <input type="radio" name="requested_role" value="brand_owner" {{ old('requested_role') === 'brand_owner' ? 'checked' : '' }} class="text-[#F59E0B] focus:ring-[#F59E0B]">
                                    <div>
                                        <p class="font-semibold text-[#0F172A] text-sm">Brand Owner</p>
                                        <p class="text-xs text-[#64748B]">Kelola brand dan kolaborasi</p>
                                    </div>
                                </label>
                            @endif
                            @if($availableRoles->contains('company_owner'))
                                <label class="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#8B5CF6] hover:bg-komuna-info-soft/50 transition has-[:checked]:border-[#8B5CF6] has-[:checked]:bg-komuna-info-soft">
                                    <input type="radio" name="requested_role" value="company_owner" {{ old('requested_role') === 'company_owner' ? 'checked' : '' }} class="text-[#8B5CF6] focus:ring-[#8B5CF6]">
                                    <div>
                                        <p class="font-semibold text-[#0F172A] text-sm">Company Owner</p>
                                        <p class="text-xs text-[#64748B]">Kelola perusahaan dan brand</p>
                                    </div>
                                </label>
                            @endif
                        </div>
                        @error('requested_role')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="motivation" class="block text-sm font-medium text-[#0F172A]">Alasan / Motivasi <span class="text-[#64748B]">(opsional)</span></label>
                        <textarea name="motivation" id="motivation" rows="3"
                            class="mt-1 block w-full rounded-xl border-[#E2E8F0] shadow-sm focus:ring-[#126BFF] focus:border-[#126BFF] border px-4 py-2.5"
                            placeholder="Ceritakan mengapa kamu ingin role ini">{{ old('motivation') }}</textarea>
                        @error('motivation')
                            <p class="mt-1 text-sm text-komuna-danger">{{ $message }}</p>
                        @enderror
                    </div>

                    <button type="submit" class="w-full bg-[#126BFF] text-white py-2.5 rounded-xl font-semibold hover:bg-[#0B2D89] transition">
                        Kirim Pengajuan
                    </button>
                </div>
            </form>
        </div>
    @endif
</div>
@endsection
