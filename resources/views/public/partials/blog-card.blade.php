<a href="{{ route('blogs.show', $blog->slug) }}" class="bg-white rounded-2xl border border-komuna-border-soft overflow-hidden hover:shadow-md transition group">
    @if($blog->cover_path)
        <div class="h-44 overflow-hidden">
            <img src="{{ asset('storage/' . $blog->cover_path) }}" alt="{{ $blog->title }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
        </div>
    @else
        <div class="h-44 bg-gradient-to-br from-komuna-coral-soft to-komuna-coral/10 flex items-center justify-center">
            <svg class="w-12 h-12 text-komuna-coral/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        </div>
    @endif
    <div class="p-5">
        @if($blog->category)
            <span class="text-xs font-semibold text-komuna-coral bg-komuna-coral-soft px-2 py-0.5 rounded-full">{{ $blog->category }}</span>
        @endif
        <h3 class="font-bold text-komuna-text mt-2 group-hover:text-komuna-coral transition line-clamp-2 text-sm">{{ $blog->title }}</h3>
        @if($blog->excerpt)
            <p class="text-sm text-komuna-muted mt-2 line-clamp-2">{{ $blog->excerpt }}</p>
        @endif
        <div class="flex items-center justify-between mt-4 text-xs text-komuna-light-text">
            <span>{{ $blog->published_at ? $blog->published_at->format('d M Y') : '' }}</span>
            @if($blog->author)
                <span class="flex items-center gap-1">
                    <span class="w-5 h-5 bg-komuna-coral rounded-full flex items-center justify-center text-white text-[10px] font-bold">{{ substr($blog->author->name, 0, 1) }}</span>
                    {{ $blog->author->name }}
                </span>
            @endif
        </div>
    </div>
</a>