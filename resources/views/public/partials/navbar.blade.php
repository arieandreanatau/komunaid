<nav class="bg-white shadow-sm border-b border-komuna-border sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="{{ route('home') }}">
                    <x-logo size="md" />
                </a>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-1">
                    <a href="{{ route('home') }}" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg {{ request()->routeIs('home') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50' }}">Beranda</a>
                    <a href="{{ route('communities.directory') }}" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg {{ request()->routeIs('communities.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50' }}">Komunitas</a>
                    <a href="{{ route('events.index') }}" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg {{ request()->routeIs('events.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50' }}">Events</a>
                    <a href="{{ route('blogs.index') }}" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg {{ request()->routeIs('blogs.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50' }}">Blog</a>
                    <a href="{{ route('about') }}" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg {{ request()->routeIs('about') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50' }}">Tentang Kami</a>
                    <a href="{{ route('contact') }}" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg {{ request()->routeIs('contact') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50' }}">Hubungi Kami</a>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                @auth
                    <div class="hidden sm:flex items-center space-x-3">
                        @if(auth()->user()->hasRole('superadmin'))
                            <a href="{{ route('superadmin.dashboard') }}" class="text-sm font-medium text-komuna-navy hover:text-komuna-blue">Admin Panel</a>
                        @endif
                        <a href="{{ auth()->user()->getDashboardRoute() }}" class="text-sm text-komuna-muted hover:text-komuna-blue">Dashboard</a>
                        <div class="w-8 h-8 bg-komuna-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {{ substr(auth()->user()->name, 0, 1) }}
                        </div>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="text-sm text-komuna-muted hover:text-komuna-danger">Logout</button>
                        </form>
                    </div>
                @else
                    <a href="{{ route('login') }}" class="text-sm font-medium text-komuna-text hover:text-komuna-coral">Login</a>
                    <a href="{{ route('register') }}" class="bg-komuna-coral text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-komuna-coral-dark transition">Gabung Sekarang</a>
                @endauth
                <button id="mobile-menu-btn" class="sm:hidden text-komuna-muted hover:text-komuna-blue" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
            </div>
        </div>
    </div>
    <div id="mobile-menu" class="hidden sm:hidden border-t border-komuna-border bg-white">
        <div class="px-4 py-3 space-y-1">
            <a href="{{ route('home') }}" class="block px-3 py-2 rounded-lg text-sm font-medium {{ request()->routeIs('home') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50' }}">Beranda</a>
            <a href="{{ route('communities.directory') }}" class="block px-3 py-2 rounded-lg text-sm font-medium {{ request()->routeIs('communities.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50' }}">Komunitas</a>
            <a href="{{ route('events.index') }}" class="block px-3 py-2 rounded-lg text-sm font-medium {{ request()->routeIs('events.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50' }}">Events</a>
            <a href="{{ route('blogs.index') }}" class="block px-3 py-2 rounded-lg text-sm font-medium {{ request()->routeIs('blogs.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50' }}">Blog</a>
            <a href="{{ route('about') }}" class="block px-3 py-2 rounded-lg text-sm font-medium {{ request()->routeIs('about') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50' }}">Tentang Kami</a>
            <a href="{{ route('contact') }}" class="block px-3 py-2 rounded-lg text-sm font-medium {{ request()->routeIs('contact') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50' }}">Hubungi Kami</a>
            @guest
                <div class="border-t border-komuna-border pt-3 mt-3 space-y-2">
                    <a href="{{ route('login') }}" class="block px-3 py-2 rounded-lg text-sm font-medium text-komuna-text hover:bg-komuna-light/50">Login</a>
                    <a href="{{ route('register') }}" class="block px-3 py-2 rounded-lg text-sm font-semibold text-white bg-komuna-coral hover:bg-komuna-coral-dark text-center">Gabung Sekarang</a>
                </div>
            @else
                <div class="border-t border-komuna-border pt-3 mt-3">
                    <a href="{{ auth()->user()->getDashboardRoute() }}" class="block px-3 py-2 rounded-lg text-sm font-medium text-komuna-blue hover:bg-komuna-light">Dashboard</a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-komuna-danger hover:bg-komuna-danger-soft">Logout</button>
                    </form>
                </div>
            @endguest
        </div>
    </div>
</nav>
