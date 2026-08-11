<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Consulta pública SIGTU</title>
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
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 text-center">Consulta pública de títulos</h1>
            <p class="mt-2 text-center text-gray-600 text-sm">
                Busque por número de título o nombre del graduado.
            </p>

            <form method="GET" action="{{ route('consulta-publica') }}" class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2">
                <input type="text" name="q" value="{{ request('q') }}" placeholder="Número de título o nombre del graduado..."
                    class="w-full flex-1 rounded-md border-gray-300 shadow-sm" required>
                <button type="submit" class="px-4 py-2 bg-pggl-700 text-white rounded-md font-semibold hover:bg-pggl-800">
                    Buscar
                </button>
            </form>

            <div class="mt-8 sm:mt-10">
                @forelse ($titulos as $titulo)
                    <div class="bg-white rounded-lg shadow p-5 sm:p-6 mb-4">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div>
                                <h2 class="font-semibold text-lg text-gray-900">{{ $titulo->titulacion->graduado->nombre_completo }}</h2>
                                <p class="text-sm text-gray-600 mt-1">Carrera: {{ $titulo->titulacion->carrera }}</p>
                                <p class="text-sm text-gray-600">Número de título: {{ $titulo->numero_titulo }}</p>
                                <p class="text-sm text-gray-600">Fecha: {{ $titulo->titulacion->fecha_titulacion?->format('d/m/Y') ?? '—' }}</p>
                            </div>
                            <span class="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Verificado
                            </span>
                        </div>
                        <div class="mt-4">
                            <a href="{{ route('consulta-publica.verificar', $titulo->uuid) }}" class="text-pggl-700 hover:underline text-sm">
                                Ver detalle de verificación
                            </a>
                        </div>
                    </div>
                @empty
                    @if (request('q'))
                        <div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                            No se encontraron títulos para "{{ request('q') }}".
                        </div>
                    @else
                        <div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                            Ingrese un criterio de búsqueda para consultar títulos verificados.
                        </div>
                    @endif
                @endforelse
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
