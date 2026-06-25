@extends('layouts.admin')

@php $pageTitle = 'Suggestions' @endphp

@section('content')
<div>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-lg font-semibold text-[#0B2D89]">Suggestions</h2>
            <p class="text-sm text-[#64748B] mt-1">View feedback and suggestions submitted by users.</p>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-[#E2E8F0] bg-[#EEF7FF]">
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Name</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Email</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Subject</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Message</th>
                        <th class="text-center px-6 py-3 font-semibold text-[#0B2D89]">Status</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Date</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                    @forelse($suggestions as $suggestion)
                        <tr class="hover:bg-[#EEF7FF]/50 transition">
                            <td class="px-6 py-3.5 text-[#0F172A] font-medium">{{ $suggestion->name }}</td>
                            <td class="px-6 py-3.5 text-[#64748B] text-xs">{{ $suggestion->email }}</td>
                            <td class="px-6 py-3.5 text-[#0F172A]">{{ $suggestion->subject }}</td>
                            <td class="px-6 py-3.5 text-[#64748B] text-xs max-w-xs truncate" title="{{ $suggestion->message }}">
                                {{ Str::limit($suggestion->message, 60) }}
                            </td>
                            <td class="px-6 py-3.5 text-center">
                                @if(($suggestion->status ?? 'pending') === 'pending')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B]">Pending</span>
                                @elseif(($suggestion->status ?? 'pending') === 'read')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#126BFF]/10 text-[#126BFF]">Read</span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16A34A]/10 text-[#16A34A]">{{ ucfirst($suggestion->status) }}</span>
                                @endif
                            </td>
                            <td class="px-6 py-3.5 text-[#64748B] text-xs whitespace-nowrap">{{ $suggestion->created_at?->format('d M Y') ?? '-' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center">
                                <svg class="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p class="text-[#64748B] text-sm">No suggestions found.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(method_exists($suggestions, 'links'))
            <div class="px-6 py-4 border-t border-[#E2E8F0]">{{ $suggestions->links() }}</div>
        @endif
    </div>
</div>
@endsection
