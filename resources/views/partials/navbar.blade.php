<nav class="bg-white shadow-sm border-b border-komuna-border-soft">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="{{ route('home') }}" class="flex-shrink-0">
                    @include('partials.logo', ['size' => 'md'])
                </a>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a href="{{ route('home') }}" class="inline-flex items-center px-1 pt-1 text-sm font-medium {{ request()->routeIs('home') ? 'text-komuna-blue border-b-2 border-komuna-blue' : 'text-komuna-text hover:text-komuna-blue' }}">Home</a>
                    <a href="{{ route('communities.directory') }}" class="inline-flex items-center px-1 pt-1 text-sm font-medium {{ request()->routeIs('communities.*') ? 'text-komuna-blue border-b-2 border-komuna-blue' : 'text-komuna-text hover:text-komuna-blue' }}">Komunitas</a>
                    <a href="{{ route('events.index') }}" class="inline-flex items-center px-1 pt-1 text-sm font-medium {{ request()->routeIs('events.*') ? 'text-komuna-blue border-b-2 border-komuna-blue' : 'text-komuna-text hover:text-komuna-blue' }}">Events</a>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                @auth
                    <div class="flex items-center space-x-3">
                        @if(auth()->user()->hasRole('superadmin'))
                            <a href="{{ route('superadmin.dashboard') }}" class="text-sm font-medium text-komuna-navy hover:text-komuna-blue transition">Admin Panel</a>
                        @endif
                        @if(auth()->user()->hasRole('community_owner'))
                            <a href="{{ route('community.dashboard') }}" class="text-sm text-komuna-muted hover:text-komuna-blue transition">Owner Panel</a>
                        @endif
                        @if(auth()->user()->hasRole('brand_owner'))
                            <a href="{{ route('brand.dashboard') }}" class="text-sm text-komuna-muted hover:text-komuna-blue transition">Brand Panel</a>
                        @endif
                        <a href="{{ auth()->user()->getDashboardRoute() }}" class="text-sm text-komuna-muted hover:text-komuna-blue transition">Dashboard</a>
                        <span class="text-sm text-komuna-text font-medium">{{ auth()->user()->name }}</span>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="text-sm text-komuna-danger hover:text-komuna-danger/80 transition">Logout</button>
                        </form>
                    </div>
                @else
                    <a href="{{ route('login') }}" class="text-sm text-komuna-muted hover:text-komuna-blue transition">Login</a>
                    <a href="{{ route('register') }}" class="bg-komuna-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-komuna-navy transition">Register</a>
                @endauth
            </div>
        </div>
    </div>
</nav>
