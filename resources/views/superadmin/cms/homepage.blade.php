@extends('layouts.admin')

@php $pageTitle = 'Homepage Sections' @endphp

@section('content')
<div>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-lg font-semibold text-[#0B2D89]">Homepage Sections</h2>
            <p class="text-sm text-[#64748B] mt-1">Manage the sections displayed on the homepage.</p>
        </div>
    </div>

    @if($sections->count() > 0)
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div class="divide-y divide-[#E2E8F0]">
                @foreach($sections as $section)
                    <div class="px-6 py-4 flex items-center justify-between hover:bg-[#EEF7FF]/50 transition">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-[#126BFF]/10 rounded-lg flex items-center justify-center text-[#126BFF] font-bold text-sm">
                                {{ $section->sort_order ?? $loop->iteration }}
                            </div>
                            <div>
                                <h4 class="text-[#0F172A] font-medium text-sm">{{ $section->title ?? $section->name ?? 'Section ' . $loop->iteration }}</h4>
                                <p class="text-[#64748B] text-xs mt-0.5">{{ $section->type ?? 'content' }}</p>
                            </div>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16A34A]/10 text-[#16A34A]">Active</span>
                    </div>
                @endforeach
            </div>
        </div>
    @else
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
            <svg class="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <h3 class="text-[#0F172A] font-semibold text-base mb-1">No Sections Yet</h3>
            <p class="text-[#64748B] text-sm">Homepage sections will be created in the next phase.</p>
        </div>
    @endif

    <div class="mt-6 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg px-5 py-3">
        <p class="text-[#F59E0B] text-sm font-medium flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            CMS penuh akan dibangun di Prompt 6
        </p>
    </div>
</div>
@endsection
