@props(['title' => 'Fitur Premium', 'description' => 'Fitur ini tersedia untuk akun yang memiliki trial atau subscription aktif.', 'showTrialCta' => true, 'expired' => false])

<div class="relative overflow-hidden">
    <div class="bg-white rounded-xl border border-komuna-border p-6">
        <div class="flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-komuna-light rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 mb-3">
                Premium
            </span>
            <h3 class="text-sm font-semibold text-komuna-text">{{ $title }}</h3>
            <p class="text-sm text-komuna-muted mt-1 max-w-xs">{{ $description }}</p>
            @if($expired)
                <p class="text-xs text-komuna-danger mt-2 font-medium">Trial kamu sudah berakhir.</p>
            @endif
            @if($showTrialCta)
                <div class="flex flex-col sm:flex-row gap-2 mt-4">
                    <a href="{{ route('member.role-requests.index') ?? '#' }}" class="inline-flex items-center justify-center px-4 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy transition">
                        Ajukan Trial
                    </a>
                    <a href="{{ route('contact') ?? '#' }}" class="inline-flex items-center justify-center px-4 py-2 bg-komuna-border-soft text-komuna-muted text-sm font-medium rounded-lg hover:bg-komuna-border transition">
                        Hubungi Superadmin
                    </a>
                </div>
            @endif
        </div>
    </div>
</div>
