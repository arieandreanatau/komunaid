@extends('layouts.admin')

@php $pageTitle = 'CMS Dashboard' @endphp

@section('content')
<div>
    <p class="text-sm text-[#64748B] mb-6">Manage your website content from one place.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <a href="{{ route('superadmin.cms.homepage.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#126BFF]/30 transition">
            <div class="w-12 h-12 bg-[#0B2D89]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0B2D89]/20 transition">
                <svg class="w-6 h-6 text-[#0B2D89]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Homepage Sections</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage homepage content sections</p>
            <div class="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#126BFF]/10 text-[#126BFF]">
                {{ $stats['homepage_sections'] ?? 0 }} sections
            </div>
        </a>

        <a href="{{ route('superadmin.cms.blogs.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#16A34A]/30 transition">
            <div class="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#16A34A]/20 transition">
                <svg class="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Blog</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage blog posts and articles</p>
            <div class="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16A34A]/10 text-[#16A34A]">
                {{ $stats['blogs'] ?? 0 }} posts
            </div>
        </a>

        <a href="{{ route('superadmin.cms.contact.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#F59E0B]/30 transition">
            <div class="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition">
                <svg class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Contact Settings</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage contact page information</p>
            <div class="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B]">
                {{ $stats['contact_settings'] ?? 0 }} settings
            </div>
        </a>

        <a href="{{ route('superadmin.cms.suggestions.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#25B9F2]/30 transition">
            <div class="w-12 h-12 bg-[#25B9F2]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#25B9F2]/20 transition">
                <svg class="w-6 h-6 text-[#25B9F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">Suggestions</h3>
            <p class="text-[#64748B] text-sm mt-1">View user feedback and suggestions</p>
            <div class="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#25B9F2]/10 text-[#25B9F2]">
                {{ $stats['suggestions'] ?? 0 }} suggestions
            </div>
        </a>

        <a href="{{ route('superadmin.cms.pages.index') }}"
           class="group bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md hover:border-[#DC2626]/30 transition">
            <div class="w-12 h-12 bg-[#DC2626]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#DC2626]/20 transition">
                <svg class="w-6 h-6 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            </div>
            <h3 class="text-[#0F172A] font-semibold text-base">CMS Pages</h3>
            <p class="text-[#64748B] text-sm mt-1">Manage static pages (T&C, Privacy, etc.)</p>
            <div class="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DC2626]/10 text-[#DC2626]">
                {{ $stats['cms_pages'] ?? 0 }} pages
            </div>
        </a>
    </div>
</div>
@endsection
