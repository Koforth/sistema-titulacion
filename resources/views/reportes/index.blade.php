<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Reportes</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <div class="flex flex-wrap gap-2">
                    @foreach ($tipos as $clave => $etiqueta)
                        <a href="{{ route('reportes.index', ['tipo' => $clave]) }}"
                           class="px-3 py-2 rounded text-sm font-semibold border {{ $tipo === $clave ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' }}">
                            {{ $etiqueta }}
                        </a>
                    @endforeach
                </div>
            </div>

            @if ($titulos->isNotEmpty())
                <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                    <h3 class="font-semibold text-lg p-6 pb-2">Resultados ({{ $titulos->count() }})</h3>
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Número</th>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Graduado</th>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Carrera</th>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Ubicación</th>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Etapa</th>
                                <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach ($titulos as $titulo)
                                <tr>
                                    <td class="px-6 py-3">{{ $titulo->numero_titulo }}</td>
                                    <td class="px-6 py-3">{{ $titulo->titulacion->graduado->nombre_completo }}</td>
                                    <td class="px-6 py-3">{{ $titulo->titulacion->carrera }}</td>
                                    <td class="px-6 py-3">{{ $titulo->ubicacion_actual }}</td>
                                    <td class="px-6 py-3">
                                        @if ($titulo->titulacion->proceso)
                                            {{ $titulo->titulacion->proceso->finalizado() ? 'Entregado' : 'En curso' }}
                                        @else
                                            —
                                        @endif
                                    </td>
                                    <td class="px-6 py-3 text-right">
                                        <a href="{{ route('titulos-fisicos.historial', $titulo) }}" class="text-indigo-600 hover:underline">Hoja de vida</a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @elseif ($procesos->isNotEmpty())
                <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                    <h3 class="font-semibold text-lg p-6 pb-2">Alertas: más de 45 días ({{ $procesos->count() }})</h3>
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Graduado</th>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Carrera</th>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Inicio SLA</th>
                                <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Límite SLA</th>
                                <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach ($procesos as $proceso)
                                <tr>
                                    <td class="px-6 py-3">{{ $proceso->titulacion->graduado->nombre_completo }}</td>
                                    <td class="px-6 py-3">{{ $proceso->titulacion->carrera }}</td>
                                    <td class="px-6 py-3">{{ $proceso->fecha_inicio_sla?->format('d/m/Y') }}</td>
                                    <td class="px-6 py-3 text-red-700">{{ $proceso->fecha_limite_sla?->format('d/m/Y') }}</td>
                                    <td class="px-6 py-3 text-right">
                                        <a href="{{ route('procesos-titulo.show', $proceso) }}" class="text-blue-600 hover:underline">Ver proceso</a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-center text-gray-500">
                    Sin resultados para este reporte.
                </div>
            @endif
        </div>
    </div>
</x-app-layout>
