<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SIGTU Sistema Integral de Gestión de Títulos Universitarios</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css'])
</head>
<body class="font-sans antialiased bg-gray-50">
    <header class="bg-pggl-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2">
            <a href="{{ route('home') }}" class="flex items-center gap-2 sm:gap-3">
                <img src="{{ asset('img/logo-uncpggl.png') }}" alt="UNCPGGL" class="h-9 sm:h-10 w-auto">
                <span class="hidden md:block text-white font-semibold leading-tight">
                    SIGTU Sistema Integral de<br>Gestión de Títulos Universitarios
                </span>
            </a>
            <nav class="flex flex-wrap items-center justify-end gap-2 sm:gap-4 text-sm">
                <a href="{{ route('home') }}" class="hidden sm:inline text-pggl-100 hover:text-white">Inicio</a>
                <a href="{{ route('consulta-publica') }}" class="hidden sm:inline text-pggl-100 hover:text-white">Consultar título</a>
                @auth
                    <a href="{{ route('dashboard') }}" class="px-4 py-2 bg-pggl-600 text-white rounded-lg font-semibold hover:bg-pggl-500">Panel de administración</a>
                @else
                    <a href="{{ route('login') }}" class="px-4 py-2 bg-pggl-600 text-white rounded-lg font-semibold hover:bg-pggl-500">Iniciar sesión</a>
                @endauth
            </nav>
        </div>
    </header>

    <main>
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Sistema Integral de Gestión de Títulos Universitarios</h1>
            <p class="mt-4 text-base sm:text-lg text-gray-600">Consulta y verificación de títulos universitarios.</p>

            <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a href="{{ route('consulta-publica') }}"
                   class="inline-flex items-center justify-center px-6 py-3 bg-pggl-700 text-white rounded-lg font-semibold hover:bg-pggl-800">
                    Consultar título
                </a>
                <a href="{{ route('home') }}"
                   class="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
                    Verificar documento
                </a>
            </div>

            <div class="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl font-bold text-pggl-700">{{ $estadisticas['titulos_emitidos'] }}</div>
                    <div class="text-sm text-gray-500 mt-1">Títulos entregados</div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl font-bold text-pggl-700">{{ $estadisticas['total_registrados'] }}</div>
                    <div class="text-sm text-gray-500 mt-1">Títulos registrados</div>
                </div>
            </div>

            <div class="mt-8 sm:mt-10 text-sm text-gray-500 px-4">
                <p>Para verificar un título, utilice el código QR impreso en el documento o consulte por número de título.</p>
            </div>
        </div>
    </main>

    <footer class="bg-pggl-800 py-6 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center text-sm text-white">
            <p class="font-medium">¡Fe y Amor Por Mi Pueblo Nicaragüense!</p>
            <p class="mt-1 text-pggl-100">© {{ date('Y') }} SIGTU Sistema Integral de Gestión de Títulos Universitarios · UNCPGGL</p>
        </div>
    </footer>
</body>
</html>
