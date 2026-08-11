<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Hoja de vida — {{ $titulo->numero_titulo }}</h2>
            <a href="{{ route('titulos-fisicos.show', $titulo) }}" class="text-gray-600 hover:underline text-sm">Volver al título</a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <dl class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><dt class="font-medium text-gray-500">Graduado</dt><dd>{{ $titulo->titulacion->graduado->nombre_completo }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Carrera</dt><dd>{{ $titulo->titulacion->carrera }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Número de título</dt><dd>{{ $titulo->numero_titulo }}</dd></div>
                    <div>
                        <dt class="font-medium text-gray-500">Ubicación actual</dt>
                        <dd>{{ $titulo->ubicacion_actual }}</dd>
                    </div>
                    <div>
                        <dt class="font-medium text-gray-500">Estado del proceso</dt>
                        <dd>
                            @if ($titulo->titulacion->proceso?->finalizado())
                                Finalizado
                            @else
                                En curso
                            @endif
                        </dd>
                    </div>
                </dl>
            </div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-6">Historial documental</h3>
                <ol class="relative border-s border-gray-200 ml-3">
                    @forelse ($titulo->historial as $evento)
                        <li class="mb-6 ms-4">
                            <span class="absolute w-3 h-3 bg-blue-600 rounded-full mt-1.5 -start-1.5 border border-white"></span>
                            <time class="mb-1 text-sm font-normal leading-none text-gray-400">
                                {{ $evento->fecha->format('d/m/Y H:i') }}
                            </time>
                            <h4 class="text-sm font-semibold text-gray-800">{{ $evento->tipo_evento }}</h4>
                            @if ($evento->descripcion)
                                <p class="mb-1 text-sm font-normal text-gray-500">{{ $evento->descripcion }}</p>
                            @endif
                            @if ($evento->usuario)
                                <p class="text-xs text-gray-400">Por: {{ $evento->usuario->name }}</p>
                            @endif
                        </li>
                    @empty
                        <li class="ms-4 text-gray-500 text-sm">Sin eventos registrados.</li>
                    @endforelse
                </ol>
            </div>
        </div>
    </div>
</x-app-layout>
