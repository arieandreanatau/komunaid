<nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="{{ route('home') }}" class="text-xl font-bold text-emerald-600">KomunaID</a>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a href="{{ route('home') }}" class="inline-flex items-center px-1 pt-1 text-sm font-medium {{ request()->routeIs('home') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-900 hover:text-emerald-600' }}">Home</a>
                    <a href="{{ route('communities.directory') }}" class="inline-flex items-center px-1 pt-1 text-sm font-medium {{ request()->routeIs('communities.*') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-900 hover:text-emerald-600' }}">Komunitas</a>
                    <a href="{{ route('events.index') }}" class="inline-flex items-center px-1 pt-1 text-sm font-medium {{ request()->routeIs('events.*') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-900 hover:text-emerald-600' }}">Events</a>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                @auth
                    <div class="flex items-center space-x-3">
                        @if(auth()->user()->hasRole('superadmin'))
                            <a href="{{ route('superadmin.dashboard') }}" class="text-sm font-medium text-red-600 hover:text-red-800">Superadmin</a>
                        @endif
                        @if(auth()->user()->hasRole('community_owner'))
                            <a href="{{ route('community.dashboard') }}" class="text-sm text-gray-700 hover:text-emerald-600">Owner Panel</a>
                        @endif
                        @if(auth()->user()->hasRole('brand_owner'))
                            <a href="{{ route('brand.dashboard') }}" class="text-sm text-gray-700 hover:text-emerald-600">Brand Panel</a>
                        @endif
                        <a href="{{ auth()->user()->getDashboardRoute() }}" class="text-sm text-gray-700 hover:text-emerald-600">Dashboard</a>
                        <span class="text-sm text-gray-500">{{ auth()->user()->name }}</span>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="text-sm text-red-600 hover:text-red-800">Logout</button>
                        </form>
                    </div>
                @else
                    <a href="{{ route('login') }}" class="text-sm text-gray-700 hover:text-emerald-600">Login</a>
                    <a href="{{ route('register') }}" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Register</a>
                @endauth
            </div>
        </div>
    </div>
</nav>
