@extends('layouts.admin')

@section('content')
<div class="max-w-7xl mx-auto">
    <div class="mb-6">
        <a href="{{ route('superadmin.documentation.index') }}" class="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#0B2D89] transition mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Documentation
        </a>
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-[#0B2D89]">{{ $documentationFile->title }}</h1>
                <div class="flex items-center gap-3 mt-2 text-sm text-[#64748B]">
                    <span class="uppercase">{{ $documentationFile->format }}</span>
                    <span>&middot;</span>
                    <span>{!! $documentationFile->status_badge !!}</span>
                    <span>&middot;</span>
                    <span>{{ $documentationFile->generated_at ? $documentationFile->generated_at->format('d M Y H:i') : '-' }}</span>
                    @if($documentationFile->generatedByUser)
                        <span>&middot;</span>
                        <span>{{ $documentationFile->generatedByUser->name }}</span>
                    @endif
                </div>
            </div>
            <div class="flex items-center gap-2">
                <a href="{{ route('superadmin.documentation.preview', $documentationFile) }}" class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] text-[#64748B] rounded-lg text-sm font-medium hover:bg-komuna-surface transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                    Preview
                </a>
                <a href="{{ route('superadmin.documentation.download', $documentationFile) }}" class="inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Download
                </a>
            </div>
        </div>
    </div>

    @if($documentationFile->metadata)
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <div class="text-xs text-[#64748B]">Words</div>
                <div class="text-lg font-bold text-[#0B2D89]">{{ number_format($documentationFile->metadata['word_count'] ?? 0) }}</div>
            </div>
            <div class="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <div class="text-xs text-[#64748B]">Lines</div>
                <div class="text-lg font-bold text-[#0B2D89]">{{ number_format($documentationFile->metadata['line_count'] ?? 0) }}</div>
            </div>
            <div class="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <div class="text-xs text-[#64748B]">Characters</div>
                <div class="text-lg font-bold text-[#0B2D89]">{{ number_format($documentationFile->metadata['char_count'] ?? 0) }}</div>
            </div>
            <div class="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <div class="text-xs text-[#64748B]">Generator</div>
                <div class="text-lg font-bold text-[#0B2D89]">v{{ $documentationFile->metadata['generator_version'] ?? '1.0' }}</div>
            </div>
        </div>
    @endif

    <div class="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 class="font-semibold text-[#0F172A]">Content</h2>
            <div class="flex items-center gap-2">
                <form method="POST" action="{{ route('superadmin.documentation.generate.single', $documentationFile->document_key) }}">
                    @csrf
                    <input type="hidden" name="format" value="{{ $documentationFile->format }}">
                    <button type="submit" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#126BFF] text-white rounded text-xs font-medium hover:bg-[#0B2D89] transition">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        Regenerate
                    </button>
                </form>
            </div>
        </div>
        <div class="p-6">
            @if($content)
                <pre class="text-sm text-[#0F172A] whitespace-pre-wrap font-mono leading-relaxed max-h-[600px] overflow-y-auto">{{ $content }}</pre>
            @else
                <div class="text-center py-12">
                    <p class="text-[#64748B]">File content tidak tersedia</p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
