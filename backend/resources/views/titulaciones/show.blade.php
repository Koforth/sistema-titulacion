<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Titulación: {{ $titulacion->graduado->nombre_completo }}</h2>
            <a href="{{ route('titulaciones.edit', $titulacion) }}" class="text-indigo-600 hover:underline text-sm">Editar</a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><dt class="font-medium text-gray-500">Graduado</dt><dd>{{ $titulacion->graduado->nombre_completo }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Carnet</dt><dd>{{ $titulacion->graduado->carnet ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Carrera</dt><dd>{{ $titulacion->carrera }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Modalidad</dt><dd>{{ $titulacion->modalidad ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Fecha</dt><dd>{{ $titulacion->fecha_titulacion?->format('d/m/Y') ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Estado</dt><dd>{{ $titulacion->estado }}</dd></div>
                </dl>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 class="font-semibold text-lg mb-4">Proceso de titulación</h3>
                    @if ($titulacion->proceso)
                        <p>
                            <a href="{{ route('procesos-titulo.show', $titulacion->proceso) }}" class="text-blue-600 hover:underline">Ver proceso</a>
                        </p>
                    @else
                        <form method="POST" action="{{ route('procesos-titulo.crear', $titulacion) }}">
                            @csrf
                            <x-primary-button>Crear proceso</x-primary-button>
                        </form>
                    @endif
                </div>

                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 class="font-semibold text-lg mb-4">Título físico</h3>
                    @if ($titulacion->tituloFisico)
                        <p>
                            <a href="{{ route('titulos-fisicos.show', $titulacion->tituloFisico) }}" class="text-blue-600 hover:underline">
                                {{ $titulacion->tituloFisico->numero_titulo }}
                            </a>
                            <span class="ml-2 px-2 py-1 rounded text-xs font-semibold bg-teal-100 text-teal-800">{{ $titulacion->tituloFisico->ubicacion_actual }}</span>
                        </p>
                    @else
                        <a href="{{ route('titulos-fisicos.create') }}" class="text-green-600 hover:underline text-sm">Crear título físico</a>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
