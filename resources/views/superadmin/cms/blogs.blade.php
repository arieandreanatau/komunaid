@extends('layouts.admin')

@php $pageTitle = 'Blogs' @endphp

@section('content')
<div>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-lg font-semibold text-[#0B2D89]">Blog Management</h2>
            <p class="text-sm text-[#64748B] mt-1">Manage blog posts and articles for the platform.</p>
        </div>
    </div>

    @if($blogs->count() > 0)
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-[#E2E8F0] bg-[#EEF7FF]">
                            <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Title</th>
                            <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Status</th>
                            <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Date</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#E2E8F0]">
                        @foreach($blogs as $blog)
                            <tr class="hover:bg-[#EEF7FF]/50 transition">
                                <td class="px-6 py-3.5 text-[#0F172A] font-medium">{{ $blog->title }}</td>
                                <td class="px-6 py-3.5">
                                    @if($blog->is_published ?? false)
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16A34A]/10 text-[#16A34A]">Published</span>
                                    @else
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B]">Draft</span>
                                    @endif
                                </td>
                                <td class="px-6 py-3.5 text-[#64748B] text-xs">{{ $blog->created_at?->format('d M Y') ?? '-' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @if(method_exists($blogs, 'links'))
                <div class="px-6 py-4 border-t border-[#E2E8F0]">{{ $blogs->links() }}</div>
            @endif
        </div>
    @else
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
            <svg class="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
            <h3 class="text-[#0F172A] font-semibold text-base mb-1">No Blog Posts Yet</h3>
            <p class="text-[#64748B] text-sm">Blog posts will be created in the next phase.</p>
        </div>
    @endif

    <div class="mt-6 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg px-5 py-3">
        <p class="text-[#F59E0B] text-sm font-medium flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Blog penuh akan dibangun di Prompt 6
        </p>
    </div>
</div>
@endsection
