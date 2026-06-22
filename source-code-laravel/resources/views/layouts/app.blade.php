<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'KomunaID')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: '#09318E',
                        blue: '#0D7AFC',
                        'sky-blue': '#29B8FD',
                        'soft-bg': '#E9F2FA',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-soft-bg min-h-screen">
    <nav class="bg-navy text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="{{ route('home') }}" class="text-xl font-bold text-white">
                        <span class="text-sky-blue">Komuna</span>ID
                    </a>
                    <div class="hidden md:flex ml-10 space-x-4">
                        <a href="{{ route('home') }}" class="hover:text-sky-blue transition">Beranda</a>
                        <a href="{{ route('public.communities') }}" class="hover:text-sky-blue transition">Komunitas</a>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    @auth
                        <a href="{{ route('dashboard') }}" class="bg-blue hover:bg-sky-blue px-4 py-2 rounded-lg transition">
                            Dashboard
                        </a>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="text-sky-blue hover:text-white transition">Logout</button>
                        </form>
                    @else
                        <a href="{{ route('login') }}" class="hover:text-sky-blue transition">Masuk</a>
                        <a href="{{ route('register') }}" class="bg-blue hover:bg-sky-blue px-4 py-2 rounded-lg transition">Daftar</a>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <main>
        @if(session('success'))
            <div class="max-w-7xl mx-auto mt-4 px-4">
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {{ session('success') }}
                </div>
            </div>
        @endif

        @if(session('error'))
            <div class="max-w-7xl mx-auto mt-4 px-4">
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {{ session('error') }}
                </div>
            </div>
        @endif

        @yield('content')
    </main>

    <footer class="bg-navy text-white mt-16 py-8">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-sky-blue font-bold text-lg mb-2"><span class="text-white">Komuna</span>ID</p>
            <p class="text-sm text-gray-300">&copy; {{ date('Y') }} KomunaID. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
