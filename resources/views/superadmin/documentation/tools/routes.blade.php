@extends('layouts.admin')

@section('content')
<div class="max-w-7xl mx-auto">
    <div class="mb-6">
        <a href="{{ route('superadmin.documentation.index') }}" class="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#0B2D89] transition mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Documentation
        </a>
        <h1 class="text-2xl font-bold text-[#0B2D89]">Route Inventory</h1>
        <p class="text-sm text-[#64748B] mt-1">Total {{ $totalRoutes }} routes terdaftar</p>
    </div>

    @foreach($grouped as $groupName => $routes)
        <div class="mb-6">
            <h2 class="text-lg font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[#126BFF]"></span>
                {{ $groupName }} ({{ $routes->count() }})
            </h2>
            <div class="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-[#EEF7FF]">
                            <tr>
                                <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Method</th>
                                <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">URI</th>
                                <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Name</th>
                                <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Middleware</th>
                                <th class="text-left px-4 py-2 text-xs font-semibold text-[#64748B] uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#E2E8F0]">
                            @foreach($routes as $route)
                                <tr class="hover:bg-komuna-surface transition">
                                    <td class="px-4 py-2">
                                        <code class="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">{{ $route['methods'] }}</code>
                                    </td>
                                    <td class="px-4 py-2">
                                        <code class="text-xs text-[#0F172A]">{{ $route['uri'] }}</code>
                                    </td>
                                    <td class="px-4 py-2">
                                        <code class="text-xs text-[#126BFF]">{{ $route['name'] }}</code>
                                    </td>
                                    <td class="px-4 py-2 text-xs text-[#64748B]">{{ $route['middleware'] }}</td>
                                    <td class="px-4 py-2 text-xs text-[#64748B]">{{ $route['action'] }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    @endforeach
</div>
@endsection
