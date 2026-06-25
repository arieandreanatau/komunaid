@extends('layouts.admin')

@section('content')
<div class="max-w-7xl mx-auto">
    <div class="mb-6">
        <a href="{{ route('superadmin.documentation.show', $documentationFile) }}" class="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#0B2D89] transition mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali
        </a>
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-[#0B2D89]">Preview: {{ $documentationFile->title }}</h1>
                <p class="text-sm text-[#64748B] mt-1">Format: {{ strtoupper($documentationFile->format) }} | Generated: {{ $documentationFile->generated_at ? $documentationFile->generated_at->format('d M Y H:i') : '-' }}</p>
            </div>
            <a href="{{ route('superadmin.documentation.download', $documentationFile) }}" class="inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Download
            </a>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        @if($content)
            @if($documentationFile->format === 'html')
                <iframe srcdoc="{{ htmlspecialchars($content, ENT_QUOTES) }}" class="w-full min-h-[700px] border-0"></iframe>
            @else
                <div class="p-8">
                    <pre class="text-sm text-[#0F172A] whitespace-pre-wrap font-mono leading-relaxed">{{ $content }}</pre>
                </div>
            @endif
        @else
            <div class="px-6 py-16 text-center">
                <p class="text-[#64748B]">File content tidak tersedia</p>
            </div>
        @endif
    </div>
</div>
@endsection
