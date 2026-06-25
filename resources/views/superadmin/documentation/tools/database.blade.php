@extends('layouts.admin')

@section('content')
<div class="max-w-7xl mx-auto">
    <div class="mb-6">
        <a href="{{ route('superadmin.documentation.index') }}" class="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#0B2D89] transition mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Documentation
        </a>
        <h1 class="text-2xl font-bold text-[#0B2D89]">Database Inventory</h1>
        <p class="text-sm text-[#64748B] mt-1">{{ $totalTables }} tables | {{ number_format($totalColumns) }} total columns</p>
    </div>

    @foreach($tableData as $table)
        <div class="mb-6 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div class="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 class="font-semibold text-[#0F172A] flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#126BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>
                    {{ $table['name'] }}
                </h2>
                <span class="text-sm text-[#64748B]">{{ number_format($table['count']) }} rows</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-[#EEF7FF]">
                        <tr>
                            <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Column</th>
                            <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Type</th>
                            <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Null</th>
                            <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Default</th>
                            <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Key</th>
                            <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Extra</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#E2E8F0]">
                        @foreach($table['columns'] as $col)
                            <tr class="hover:bg-komuna-surface transition">
                                <td class="px-4 py-2">
                                    <code class="text-xs font-semibold text-[#0F172A]">{{ $col->Field }}</code>
                                </td>
                                <td class="px-4 py-2">
                                    <code class="text-xs text-[#126BFF]">{{ $col->Type }}</code>
                                </td>
                                <td class="px-4 py-2 text-xs text-[#64748B]">{{ $col->Null }}</td>
                                <td class="px-4 py-2 text-xs text-[#64748B]">{{ $col->Default ?? 'NULL' }}</td>
                                <td class="px-4 py-2">
                                    @if($col->Key === 'PRI')
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">PRI</span>
                                    @elseif($col->Key === 'MUL')
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">MUL</span>
                                    @elseif($col->Key === 'UNI')
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">UNI</span>
                                    @else
                                        <span class="text-xs text-[#64748B]">-</span>
                                    @endif
                                </td>
                                <td class="px-4 py-2 text-xs text-[#64748B]">{{ $col->Extra ?: '-' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endforeach
</div>
@endsection
