@extends('simplified.layouts.dashboard')
@section('title', 'Pengajuan Saya')
@section('content')
<h1 class="text-2xl font-bold text-gray-900 mb-4">Pengajuan Saya</h1>

@if($submissions->isEmpty())
    <div class="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
        Belum ada pengajuan. <a href="{{ route('simplified.dashboard') }}" class="text-indigo-600">Kembali ke dashboard</a>.
    </div>
@else
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left px-4 py-2">Jenis</th>
                    <th class="text-left px-4 py-2">Nama</th>
                    <th class="text-left px-4 py-2">Status</th>
                    <th class="text-left px-4 py-2">Tanggal Submit</th>
                    <th class="text-left px-4 py-2">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @foreach($submissions as $s)
                    <tr class="border-t">
                        <td class="px-4 py-2">{{ $s->type_label }}</td>
                        <td class="px-4 py-2 font-medium">{{ $s->name }}</td>
                        <td class="px-4 py-2">
                            @php $colors = ['pending_approval'=>'bg-yellow-100 text-yellow-800','need_revision'=>'bg-orange-100 text-orange-800','approved'=>'bg-green-100 text-green-800','rejected'=>'bg-red-100 text-red-800','suspended'=>'bg-gray-200 text-gray-800']; @endphp
                            <span class="px-2 py-0.5 rounded text-xs {{ $colors[$s->status] ?? 'bg-gray-100' }}">{{ str_replace('_',' ',$s->status) }}</span>
                        </td>
                        <td class="px-4 py-2 text-gray-500">{{ optional($s->submitted_at)->format('d M Y H:i') ?? '-' }}</td>
                        <td class="px-4 py-2">
                            <a href="{{ route('simplified.submissions.show', ['type'=>$s->type,'id'=>$s->id]) }}" class="text-indigo-600">Detail</a>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endif
@endsection
