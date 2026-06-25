@extends('layouts.dashboard')

@section('content')
<div class="max-w-5xl mx-auto space-y-8">

    {{-- Header --}}
    <div>
        <h1 class="text-2xl font-bold text-komuna-text">Pilih Interest Anda</h1>
        <p class="text-komuna-muted mt-1">Pilih minat dan hobi Anda untuk mendapatkan rekomendasi komunitas yang sesuai.</p>
    </div>

    {{-- Search --}}
    <div class="relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-komuna-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" id="interestSearch" placeholder="Cari interest..."
            class="w-full pl-12 pr-4 py-3 rounded-xl border border-komuna-border bg-komuna-surface text-komuna-text focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent transition">
    </div>

    <form action="{{ route('member.interests.update') }}" method="POST" id="interestForm">
        @csrf
        @method('PUT')

        {{-- Selected count --}}
        <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-komuna-muted">
                <span id="selectedCount" class="font-semibold text-komuna-text">{{ count($selectedInterestIds) }}</span> interest dipilih
            </p>
        </div>

        {{-- Interest Grid --}}
        @if($interests && $interests->count() > 0)
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="interestGrid">
                @foreach($interests as $interest)
                    <label class="interest-card relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                        {{ in_array($interest->id, $selectedInterestIds) ? 'border-komuna-blue bg-komuna-blue/5 shadow-md' : 'border-komuna-border bg-komuna-surface hover:border-komuna-blue/30' }}"
                        data-name="{{ strtolower($interest->name) }}"
                        data-category="{{ strtolower($interest->category ?? '') }}"
                        data-description="{{ strtolower($interest->description ?? '') }}">

                        <input type="checkbox" name="interests[]" value="{{ $interest->id }}"
                            {{ in_array($interest->id, $selectedInterestIds) ? 'checked' : '' }}
                            class="hidden interest-checkbox">

                        {{-- Checkmark --}}
                        <div class="check-indicator absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            {{ in_array($interest->id, $selectedInterestIds) ? 'bg-komuna-blue border-komuna-blue' : 'border-komuna-border' }}">
                            @if(in_array($interest->id, $selectedInterestIds))
                                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                            @endif
                        </div>

                        <div class="flex-1 pr-8">
                            <h3 class="font-bold text-komuna-text text-base">{{ $interest->name }}</h3>
                            @if($interest->category)
                                <span class="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-komuna-teal/10 text-komuna-teal">
                                    {{ $interest->category }}
                                </span>
                            @endif
                            @if($interest->description)
                                <p class="text-sm text-komuna-muted mt-2 line-clamp-2">{{ $interest->description }}</p>
                            @endif
                        </div>
                    </label>
                @endforeach
            </div>
        @else
            {{-- Empty State --}}
            <div class="text-center py-16 bg-komuna-surface border border-komuna-border rounded-2xl">
                <svg class="w-16 h-16 text-komuna-muted/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                <p class="text-lg font-semibold text-komuna-text">Tidak ada interest tersedia</p>
                <p class="text-sm text-komuna-muted mt-1">Interest akan segera tersedia. Periksa kembali nanti.</p>
            </div>
        @endif

        {{-- Hidden inputs for selected interests --}}
        <div id="hiddenInputs"></div>

        {{-- Save Button --}}
        @if($interests && $interests->count() > 0)
            <div class="flex justify-end mt-8">
                <button type="submit" class="px-8 py-3 bg-komuna-blue text-white rounded-xl font-semibold hover:bg-komuna-blue/90 transition">
                    Simpan Interest
                </button>
            </div>
        @endif
    </form>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('interestSearch');
        const cards = document.querySelectorAll('.interest-card');
        const checkboxes = document.querySelectorAll('.interest-checkbox');
        const selectedCountEl = document.getElementById('selectedCount');

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            cards.forEach(card => {
                const name = card.dataset.name || '';
                const category = card.dataset.category || '';
                const description = card.dataset.description || '';
                const match = name.includes(query) || category.includes(query) || description.includes(query);
                card.style.display = match ? '' : 'none';
            });
        });

        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.tagName === 'INPUT') return;
                const cb = card.querySelector('.interest-checkbox');
                cb.checked = !cb.checked;
                updateCardState(card, cb.checked);
                updateCount();
            });
        });

        function updateCardState(card, checked) {
            if (checked) {
                card.classList.add('border-komuna-blue', 'bg-komuna-blue/5', 'shadow-md');
                card.classList.remove('border-komuna-border', 'bg-komuna-surface');
                const indicator = card.querySelector('.check-indicator');
                indicator.classList.add('bg-komuna-blue', 'border-komuna-blue');
                indicator.classList.remove('border-komuna-border');
                indicator.innerHTML = '<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>';
            } else {
                card.classList.remove('border-komuna-blue', 'bg-komuna-blue/5', 'shadow-md');
                card.classList.add('border-komuna-border', 'bg-komuna-surface');
                const indicator = card.querySelector('.check-indicator');
                indicator.classList.remove('bg-komuna-blue', 'border-komuna-blue');
                indicator.classList.add('border-komuna-border');
                indicator.innerHTML = '';
            }
        }

        function updateCount() {
            const count = document.querySelectorAll('.interest-checkbox:checked').length;
            selectedCountEl.textContent = count;
        }
    });
</script>
@endsection
