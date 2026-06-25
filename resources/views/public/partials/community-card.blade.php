@props(['featured' => false])
<a href="{{ route('communities.detail', $community->slug) }}" class="group block bg-white rounded-2xl border border-komuna-border-soft overflow-hidden hover:shadow-md transition {{ $featured ? 'sm:flex' : '' }}">
    @if($featured)
        @if($community->banner_path)
            <div class="sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                <img src="{{ asset('storage/' . $community->banner_path) }}" alt="{{ $community->name }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            </div>
        @else
            <div class="sm:w-2/5 h-48 sm:h-auto bg-gradient-to-br from-komuna-navy to-komuna-blue overflow-hidden flex items-center justify-center">
                <span class="text-5xl font-bold text-white/15">{{ strtoupper(substr($community->name, 0, 2)) }}</span>
            </div>
        @endif
        <div class="flex-1 p-6 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-3">
                @if($community->logo_path)
                    <img src="{{ asset('storage/' . $community->logo_path) }}" alt="{{ $community->name }}" class="w-10 h-10 rounded-xl object-cover border border-komuna-border-soft">
                @else
                    <div class="w-10 h-10 rounded-xl bg-komuna-coral-soft flex items-center justify-center text-komuna-coral font-bold text-sm">
                        {{ strtoupper(substr($community->name, 0, 1)) }}
                    </div>
                @endif
                <div class="min-w-0">
                    <h3 class="font-bold text-komuna-text group-hover:text-komuna-coral transition truncate">{{ $community->name }}</h3>
                    @if($community->category)
                        <span class="text-xs text-komuna-coral bg-komuna-coral-soft px-2 py-0.5 rounded-full inline-block mt-0.5">{{ $community->category->name }}</span>
                    @endif
                </div>
            </div>
            @if($community->short_description || $community->description)
                <p class="text-sm text-komuna-muted line-clamp-2 mb-3">{{ $community->short_description ?? Str::limit($community->description, 120) }}</p>
            @endif
            <div class="flex items-center gap-4 text-xs text-komuna-light-text">
                <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ $community->city ?? $community->region ?? 'Indonesia' }}
                </span>
                <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    {{ $community->active_members_count ?? $community->members_count ?? 0 }} anggota
                </span>
            </div>
        </div>
    @else
        @if($community->banner_path)
            <div class="h-36 overflow-hidden">
                <img src="{{ asset('storage/' . $community->banner_path) }}" alt="{{ $community->name }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            </div>
        @else
            <div class="h-36 bg-gradient-to-br from-komuna-navy to-komuna-blue flex items-center justify-center">
                <span class="text-3xl font-bold text-white/20">{{ strtoupper(substr($community->name, 0, 2)) }}</span>
            </div>
        @endif
        <div class="p-5">
            <div class="flex items-start gap-3 mb-3">
                @if($community->logo_path)
                    <img src="{{ asset('storage/' . $community->logo_path) }}" alt="{{ $community->name }}" class="w-9 h-9 rounded-xl object-cover border border-komuna-border-soft">
                @else
                    <div class="w-9 h-9 rounded-xl bg-komuna-coral-soft flex items-center justify-center text-komuna-coral font-bold text-xs">
                        {{ strtoupper(substr($community->name, 0, 1)) }}
                    </div>
                @endif
                <div class="min-w-0">
                    <h3 class="font-bold text-komuna-text text-sm truncate group-hover:text-komuna-coral transition">{{ $community->name }}</h3>
                    @if($community->category)
                        <span class="text-xs text-komuna-coral bg-komuna-coral-soft px-2 py-0.5 rounded-full inline-block mt-0.5">{{ $community->category->name }}</span>
                    @endif
                </div>
            </div>
            @if($community->short_description || $community->description)
                <p class="text-xs text-komuna-muted line-clamp-2 mb-3">{{ $community->short_description ?? Str::limit($community->description, 80) }}</p>
            @endif
            <div class="flex items-center justify-between text-xs text-komuna-light-text">
                <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ $community->city ?? $community->region ?? 'Indonesia' }}
                </span>
                <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    {{ $community->active_members_count ?? $community->members_count ?? 0 }}
                </span>
            </div>
        </div>
    @endif
</a>