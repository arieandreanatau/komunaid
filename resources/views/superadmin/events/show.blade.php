@extends('layouts.admin')

@php $pageTitle = 'Detail Event' @endphp

@section('content')
<div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <a href="{{ route('superadmin.events.index') }}" class="text-sm text-[#126BFF] hover:text-[#0B2D89] transition inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Kembali ke Events
            </a>
            <h1 class="text-2xl font-bold text-[#0B2D89] mt-2">{{ $event->title }}</h1>
        </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-bold text-[#0B2D89] mb-4">Info Event</h2>
                <dl class="space-y-3">
                    <div class="flex justify-between pb-3 border-b border-[#E2E8F0]">
                        <dt class="text-sm text-[#64748B]">Komunitas</dt>
                        <dd class="text-sm font-medium text-[#0F172A]">{{ $event->community->name ?? '-' }}</dd>
                    </div>
                    <div class="flex justify-between pb-3 border-b border-[#E2E8F0]">
                        <dt class="text-sm text-[#64748B]">Tanggal Mulai</dt>
                        <dd class="text-sm text-[#0F172A]">{{ $event->start_date ? $event->start_date->format('d M Y H:i') : '-' }}</dd>
                    </div>
                    <div class="flex justify-between pb-3 border-b border-[#E2E8F0]">
                        <dt class="text-sm text-[#64748B]">Tanggal Selesai</dt>
                        <dd class="text-sm text-[#0F172A]">{{ $event->end_date ? $event->end_date->format('d M Y H:i') : '-' }}</dd>
                    </div>
                    <div class="flex justify-between pb-3 border-b border-[#E2E8F0]">
                        <dt class="text-sm text-[#64748B]">Lokasi</dt>
                        <dd><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#25B9F2]/10 text-[#25B9F2] capitalize">{{ $event->location_type ?? '-' }}</span></dd>
                    </div>
                    <div class="flex justify-between pb-3 border-b border-[#E2E8F0]">
                        <dt class="text-sm text-[#64748B]">Status</dt>                        <dd>
                            @php
                                $statusColors = [
                                    'draft' => 'bg-komuna-border-soft text-komuna-muted',
                                    'published' => 'bg-[#126BFF]/10 text-[#126BFF]',
                                    'ongoing' => 'bg-[#25B9F2]/10 text-[#25B9F2]',
                                    'completed' => 'bg-[#16A34A]/10 text-[#16A34A]',
                                    'cancelled' => 'bg-[#DC2626]/10 text-[#DC2626]',
                                    'archived' => 'bg-[#F59E0B]/10 text-[#F59E0B]',
                                ];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$event->status] ?? 'bg-komuna-border-soft text-komuna-muted' }}">{{ ucfirst($event->status) }}</span>
                        </dd>
                    </div>
                    <div class="flex justify-between pb-3">
                        <dt class="text-sm text-[#64748B]">Registrasi</dt>
                        <dd><span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-[#0B2D89]/10 text-[#0B2D89] text-xs font-bold">{{ $registrationCount }}</span></dd>
                    </div>
                </dl>
            </div>

            @if($event->description)
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-bold text-[#0B2D89] mb-2">Deskripsi</h3>
                <p class="text-sm text-[#64748B]">{{ $event->description }}</p>
            </div>
            @endif

            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-bold text-[#0B2D89] mb-4">Aksi</h3>
                <div class="space-y-3">
                    <form method="POST" action="{{ route('superadmin.events.cancel', $event) }}">
                        @csrf
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-[#0F172A]">Alasan Pembatalan</label>
                            <textarea name="reason" rows="3" required class="block w-full rounded-xl border-[#E2E8F0] shadow-sm focus:ring-[#DC2626] focus:border-[#DC2626] border px-4 py-2.5 text-sm" placeholder="Alasan pembatalan..."></textarea>
                            @error('reason')<p class="text-sm text-[#DC2626]">{{ $message }}</p>@enderror
                        </div>
                        <button type="submit" class="w-full mt-2 bg-[#DC2626] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm" onclick="return confirm('Batalkan event ini?')">Cancel Event</button>
                    </form>
                    <form method="POST" action="{{ route('superadmin.events.archive', $event) }}">
                        @csrf
                        <button type="submit" class="w-full bg-[#F59E0B] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition text-sm" onclick="return confirm('Arsipkan event ini?')">Archive</button>
                    </form>
                    <form method="POST" action="{{ route('superadmin.events.destroy', $event) }}">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="w-full bg-komuna-navy text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-komuna-navy-dark transition text-sm" onclick="return confirm('Hapus event ini? Data akan di-soft delete.')">Delete</button>
                    </form>
                </div>
            </div>
        </div>        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-bold text-[#0B2D89] mb-4">Peserta ({{ $registrationCount }})</h2>
                @if(isset($event->registrations) && $event->registrations->count() > 0)
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-[#E2E8F0]">
                            <thead class="bg-[#0B2D89]/5">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Nama</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Email</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Tanggal</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#E2E8F0]">
                                @foreach($event->registrations as $reg)
                                    <tr>
                                        <td class="px-4 py-3 text-sm font-medium text-[#0F172A]">{{ $reg->user->name ?? '-' }}</td>
                                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $reg->user->email ?? '-' }}</td>
                                        <td class="px-4 py-3 text-sm text-[#64748B]">{{ $reg->created_at->format('d M Y H:i') }}</td>
                                        <td class="px-4 py-3">
                                            <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                                {{ ($reg->status ?? 'confirmed') === 'confirmed' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#F59E0B]/10 text-[#F59E0B]' }}">
                                                {{ ucfirst($reg->status ?? 'confirmed') }}
                                            </span>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-[#64748B] text-center py-8">Belum ada peserta terdaftar.</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection