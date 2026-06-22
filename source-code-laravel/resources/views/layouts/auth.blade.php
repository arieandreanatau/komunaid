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
<body class="bg-white min-h-screen">
    @yield('content')
</body>
</html>
