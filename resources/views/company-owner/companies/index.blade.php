@extends('layouts.dashboard')
@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Perusahaan Saya</h1>
        <p class="text-komuna-muted">Kelola semua perusahaan yang Anda miliki.</p>
    </div>
    <a href="{{ route('company-owner.companies.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">+ Buat Perusahaan</a>
</div>
@if($companies->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-komuna-border">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Perusahaan</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Industri</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Kota</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Brand</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-komuna-border">
                    @foreach($companies as $company)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                                        @if($company->logo_path)<img src="{{ Storage::url($company->logo_path) }}" alt="" class="w-full h-full object-cover">@else{{ substr($company->name, 0, 1) }}@endif
                                    </div>
                                    <div>
                                        <a href="{{ route('company-owner.companies.show', $company) }}" class="font-semibold text-komuna-text text-sm hover:text-komuna-blue">{{ $company->name }}</a>
                                        <p class="text-xs text-komuna-muted">{{ $company->slug }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $company->industry ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $company->city ?? '-' }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $company->brands_count ?? $company->brands()->count() }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium {{ $company->status === 'active' || $company->status === 'approved' ? 'bg-komuna-success-soft text-komuna-success' : ($company->status === 'pending' ? 'bg-komuna-warning-soft text-komuna-warning' : 'bg-komuna-border-soft text-komuna-text') }}">{{ ucfirst($company->status) }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route('company-owner.companies.show', $company) }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detail</a>
                                    <a href="{{ route('company-owner.companies.edit', $company) }}" class="text-komuna-blue hover:text-komuna-blue text-sm font-medium">Edit</a>
                                    <a href="{{ route('company-owner.companies.brands.index', $company) }}" class="text-komuna-info hover:text-komuna-info text-sm font-medium">Brand</a>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">{{ $companies->links() }}</div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">🏢</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Perusahaan</h3>
        <p class="text-komuna-muted text-sm mb-4">Buat perusahaan pertama Anda.</p>
        <a href="{{ route('company-owner.companies.create') }}" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Buat Perusahaan</a>
    </div>
@endif
@endsection
