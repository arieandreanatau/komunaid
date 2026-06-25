@extends('layouts.admin')

@php $pageTitle = 'Contact Settings' @endphp

@section('content')
<div>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-lg font-semibold text-[#0B2D89]">Contact Settings</h2>
            <p class="text-sm text-[#64748B] mt-1">Manage contact page information displayed to users.</p>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-[#E2E8F0] bg-[#EEF7FF]">
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Key</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Label</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Value</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">URL</th>
                        <th class="text-center px-6 py-3 font-semibold text-[#0B2D89]">Active</th>
                        <th class="text-center px-6 py-3 font-semibold text-[#0B2D89]">Sort</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                    @forelse($settings as $setting)
                        <tr class="hover:bg-[#EEF7FF]/50 transition">
                            <td class="px-6 py-3.5 font-mono text-xs text-[#126BFF] bg-[#126BFF]/5 rounded">{{ $setting->key }}</td>
                            <td class="px-6 py-3.5 text-[#0F172A] font-medium">{{ $setting->label }}</td>
                            <td class="px-6 py-3.5 text-[#0F172A] max-w-xs truncate">{{ $setting->value }}</td>
                            <td class="px-6 py-3.5">
                                @if($setting->url)
                                    <a href="{{ $setting->url }}" target="_blank" class="text-[#126BFF] hover:underline text-xs truncate block max-w-[200px]">
                                        {{ Str::limit($setting->url, 40) }}
                                    </a>
                                @else
                                    <span class="text-[#64748B] text-xs">-</span>
                                @endif
                            </td>
                            <td class="px-6 py-3.5 text-center">
                                @if($setting->is_active)
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16A34A]/10 text-[#16A34A]">Yes</span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#64748B]/10 text-[#64748B]">No</span>
                                @endif
                            </td>
                            <td class="px-6 py-3.5 text-center text-[#64748B] text-sm">{{ $setting->sort_order }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center">
                                <svg class="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <p class="text-[#64748B] text-sm">No contact settings found.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
