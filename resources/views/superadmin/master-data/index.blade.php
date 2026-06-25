@extends('layouts.admin')

@php $pageTitle = 'Master Data' @endphp

@section('content')
<div>
    <p class="text-sm text-[#64748B] mb-6">Manage categories, interests, regions, and event types for the platform.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <a href="{{ route('superadmin.categories.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#126BFF]/30 transition">
            <div class="w-12 h-12 bg-[#126BFF]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#126BFF]/20 transition">
                <svg class="w-6 h-6 text-[#126BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Categories</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage community and event categories</p>
            <div class="mt-4 flex items-center text-[#126BFF] text-sm font-medium group-hover:gap-2 transition-all">
                Open
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>

        <a href="{{ route('superadmin.master-data.interests.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#25B9F2]/30 transition">
            <div class="w-12 h-12 bg-[#25B9F2]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#25B9F2]/20 transition">
                <svg class="w-6 h-6 text-[#25B9F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Interests</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage user interest tags</p>
            <div class="mt-4 flex items-center text-[#25B9F2] text-sm font-medium group-hover:gap-2 transition-all">
                Open
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>

        <a href="{{ route('superadmin.regions.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#16A34A]/30 transition">
            <div class="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#16A34A]/20 transition">
                <svg class="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Regions</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage regions and locations</p>
            <div class="mt-4 flex items-center text-[#16A34A] text-sm font-medium group-hover:gap-2 transition-all">
                Open
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>

        <a href="{{ route('superadmin.master-data.event-types.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#F59E0B]/30 transition">
            <div class="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition">
                <svg class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Event Types</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage event type classifications</p>
            <div class="mt-4 flex items-center text-[#F59E0B] text-sm font-medium group-hover:gap-2 transition-all">
                Open
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>
    </div>
</div>
@endsection
