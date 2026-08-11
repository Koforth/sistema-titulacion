<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verificación de título SIGTU</title>
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
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div class="bg-white rounded-lg shadow p-5 sm:p-8 overflow-hidden">
                <div class="flex items-center gap-3 mb-6">
                    <svg class="h-8 w-8 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Título verificado</h1>
                </div>

                @if ($titulo->ubicacion_actual === 'ENTREGADO')
                    <div class="px-4 py-3 bg-green-100 border border-green-400 text-green-800 rounded text-sm mb-6">
                        Este documento es un título universitario válido y registrado.
                    </div>
                @else
                    <div class="px-4 py-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm mb-6">
                        El documento está registrado pero aún no ha sido entregado al graduado.
                    </div>
                @endif

                <dl class="space-y-3 text-sm">
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-100 pb-2">
                        <dt class="font-medium text-gray-500">Graduado</dt>
                        <dd class="text-gray-900 font-semibold">{{ $titulo->titulacion->graduado->nombre_completo }}</dd>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-100 pb-2">
                        <dt class="font-medium text-gray-500">Carrera</dt>
                        <dd class="text-gray-900">{{ $titulo->titulacion->carrera }}</dd>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-100 pb-2">
                        <dt class="font-medium text-gray-500">Título</dt>
                        <dd class="text-gray-900">{{ $titulo->numero_titulo }}</dd>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-100 pb-2">
                        <dt class="font-medium text-gray-500">Fecha de titulación</dt>
                        <dd class="text-gray-900">{{ $titulo->titulacion->fecha_titulacion?->format('d/m/Y') ?? '—' }}</dd>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt class="font-medium text-gray-500">Estado de verificación</dt>
                        <dd class="text-gray-900 font-semibold">Válido</dd>
                    </div>
                </dl>

                @if ($titulo->libro || $titulo->tomo || $titulo->folio)
                    <div class="mt-6 border-t border-gray-200 pt-4 text-sm">
                        <dt class="font-medium text-gray-500 mb-2">Referencia documental</dt>
                        <dd class="text-gray-700">
                            Libro {{ $titulo->libro ?? '—' }}, Tomo {{ $titulo->tomo ?? '—' }}, Folio {{ $titulo->folio ?? '—' }}
                        </dd>
                    </div>
                @endif

                <div class="mt-6 text-xs text-gray-400 break-all">
                    Código de verificación: <code>{{ $titulo->uuid }}</code>
                </div>
            </div>

            <div class="mt-6 text-center">
                <a href="{{ route('consulta-publica') }}" class="text-pggl-700 hover:underline text-sm">Realizar otra consulta</a>
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
