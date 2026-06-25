<section class="py-20 bg-komuna-coral-soft">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-komuna-text mb-4 text-wrap-balance">{{ $title ?? 'Siap Bergabung?' }}</h2>
        <p class="text-komuna-muted mb-8 max-w-lg mx-auto">{{ $description ?? 'Mulai jelajahi komunitas sekarang dan temukan tempat yang tepat untuk Anda.' }}</p>
        @guest
            <div class="flex flex-col sm:flex-row justify-center gap-3">
                <a href="{{ $cta_primary_url ?? route('register') }}" class="inline-flex items-center justify-center bg-komuna-coral text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-komuna-coral-dark transition shadow">
                    {{ $cta_primary ?? 'Gabung Sekarang' }}
                </a>
                @if(isset($cta_secondary))
                    <a href="{{ $cta_secondary_url ?? '#' }}" class="inline-flex items-center justify-center border-2 border-komuna-coral text-komuna-coral px-8 py-3 rounded-xl text-lg font-semibold hover:bg-komuna-coral/5 transition">
                        {{ $cta_secondary }}
                    </a>
                @endif
            </div>
        @else
            <a href="{{ $cta_primary_url ?? route('communities.directory') }}" class="inline-flex items-center justify-center bg-komuna-coral text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-komuna-coral-dark transition shadow">
                {{ $cta_primary ?? 'Jelajahi Komunitas' }}
            </a>
        @endguest
    </div>
</section>