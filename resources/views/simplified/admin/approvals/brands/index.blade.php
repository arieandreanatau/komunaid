@extends('simplified.layouts.dashboard')
@section('title', 'Approval Brand')
@section('content')
<a href="{{ route('simplified.admin.approvals.index') }}" class="text-sm text-indigo-600">← Kembali</a>
<h1 class="text-2xl font-bold text-gray-900 mt-2 mb-4">Approval Brand</h1>

@php $statuses = ['pending_approval','need_revision','approved','rejected','suspended']; @endphp
<div class="flex flex-wrap gap-2 mb-4 text-sm">
    @foreach($statuses as $s)
        <a href="{{ route('simplified.admin.approvals.brands.index', ['status' => $s]) }}" class="px-3 py-1.5 rounded-lg {{ $status===$s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200' }}">{{ str_replace('_',' ',$s) }}</a>
    @endforeach
</div>

@if($items->isEmpty())
    <div class="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">Tidak ada data.</div>
@else
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50"><tr><th class="text-left px-4 py-2">Nama</th><th class="text-left px-4 py-2">Pemilik</th><th class="text-left px-4 py-2">Status</th><th class="text-left px-4 py-2">Aksi</th></tr></thead>
            <tbody>
                @foreach($items as $b)
                    <tr class="border-t">
                        <td class="px-4 py-2 font-medium">{{ $b->name }}</td>
                        <td class="px-4 py-2">{{ optional($b->owner)->name ?? '-' }}</td>
                        <td class="px-4 py-2">{{ str_replace('_',' ',$b->status) }}</td>
                        <td class="px-4 py-2"><a href="{{ route('simplified.admin.approvals.brands.show', $b->id) }}" class="text-indigo-600">Detail</a></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <div class="mt-3">{{ $items->links() }}</div>
@endif
@endsection
