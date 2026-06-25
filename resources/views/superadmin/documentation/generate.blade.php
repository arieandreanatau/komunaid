@extends('layouts.admin')

@section('content')
<div class="max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-[#0B2D89]">Generate Dokumen</h1>
            <p class="text-sm text-[#64748B] mt-1">Pilih dokumen untuk di-generate dalam format MD, TXT, atau HTML</p>
        </div>
        <div class="flex items-center gap-3">
            <form method="POST" action="{{ route('superadmin.documentation.generate.all') }}" class="inline" onsubmit="return confirm('Generate semua dokumen sekaligus?')">
                @csrf
                <input type="hidden" name="format" value="md">
                <button type="submit" class="inline-flex items-center gap-2 px-4 py-2 bg-[#126BFF] text-white rounded-lg text-sm font-medium hover:bg-[#0B2D89] transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Generate All
                </button>
            </form>
        </div>
    </div>

    @php
        $docTypes = [
            'business' => ['label' => 'Business', 'color' => 'blue'],
            'requirement' => ['label' => 'Requirement', 'color' => 'purple'],
            'technical' => ['label' => 'Technical', 'color' => 'green'],
            'database' => ['label' => 'Database', 'color' => 'orange'],
            'testing' => ['label' => 'Testing', 'color' => 'red'],
            'deployment' => ['label' => 'Deployment', 'color' => 'teal'],
            'user_guide' => ['label' => 'User Guide', 'color' => 'indigo'],
            'handover' => ['label' => 'Handover', 'color' => 'gray'],
        ];
    @endphp

    @foreach($docTypes as $typeKey => $typeInfo)
        @php
            $docsOfType = collect($availableDocs)->filter(fn($d) => $d['type'] === $typeKey);
        @endphp

        @if($docsOfType->count() > 0)
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-{{ $typeInfo['color'] }}-500"></span>
                    {{ $typeInfo['label'] }} Documents
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach($docsOfType as $key => $docInfo)
                        @php
                            $existing = $existingDocs->get($key);
                        @endphp
                        <div class="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-[#0F172A] text-sm">{{ $docInfo['title'] }}</h3>
                                    <code class="text-xs text-[#64748B] mt-1 block">{{ $key }}</code>
                                </div>
                                @if($existing)
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Generated</span>
                                @else
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-komuna-border-soft text-komuna-muted">Not Yet</span>
                                @endif
                            </div>

                            @if($existing)
                                <div class="text-xs text-[#64748B] mb-3">
                                    Last: {{ $existing->generated_at ? $existing->generated_at->format('d M Y H:i') : '-' }}
                                </div>
                            @endif

                            <div class="flex items-center gap-2">
                                <form method="POST" action="{{ route('superadmin.documentation.generate.single', $key) }}" class="flex-1">
                                    @csrf
                                    <input type="hidden" name="format" value="md">
                                    <button type="submit" class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#126BFF] text-white rounded-lg text-xs font-medium hover:bg-[#0B2D89] transition">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                        {{ $existing ? 'Regenerate' : 'Generate' }}
                                    </button>
                                </form>
                                @if($existing)
                                    <a href="{{ route('superadmin.documentation.show', $existing) }}" class="px-3 py-2 border border-[#E2E8F0] text-[#64748B] rounded-lg text-xs font-medium hover:bg-komuna-surface transition">
                                        View
                                    </a>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    @endforeach
</div>
@endsection
