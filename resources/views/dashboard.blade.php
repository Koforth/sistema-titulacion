<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if (session('success'))
                <div class="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{{ session('success') }}</span>
                </div>
            @endif
            @if (session('error'))
                <div class="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{{ session('error') }}</span>
                </div>
            @endif
            @if (session('info'))
                <div class="mb-4 bg-pggl-100 border border-pggl-400 text-pggl-800 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{{ session('info') }}</span>
                </div>
            @endif

            <!-- Indicadores -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                @php
                    $cards = [
                        ['label' => 'Títulos en proceso', 'valor' => $counts['en_proceso'], 'color' => 'bg-pggl-700'],
                        ['label' => 'En imprenta', 'valor' => $counts['en_imprenta'], 'color' => 'bg-orange-500'],
                        ['label' => 'En SETEC', 'valor' => $counts['en_setec'], 'color' => 'bg-purple-600'],
                        ['label' => 'En León', 'valor' => $counts['en_leon'], 'color' => 'bg-teal-600'],
                        ['label' => 'Entregados', 'valor' => $counts['entregados'], 'color' => 'bg-green-600'],
                        ['label' => 'Más de 45 días', 'valor' => $counts['sla_vencido'], 'color' => 'bg-red-600'],
                    ];
                @endphp
                @foreach ($cards as $card)
                    <a href="{{ $card['label'] === 'Más de 45 días' ? route('reportes.index', ['tipo' => 'sla_vencido']) : '#' }}"
                       class="rounded-lg shadow bg-white p-4 flex flex-col justify-between hover:shadow-md transition">
                        <span class="text-xs uppercase tracking-wide text-gray-500">{{ $card['label'] }}</span>
                        <span class="text-3xl font-bold {{ $card['color'] }} text-white rounded p-1 text-center mt-2">{{ $card['valor'] }}</span>
                    </a>
                @endforeach
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Últimos títulos -->
                <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg p-6">
                    <h3 class="font-semibold text-lg mb-4">Últimos títulos</h3>
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr>
                                <th class="text-left py-2">Número</th>
                                <th class="text-left py-2">Graduado</th>
                                <th class="text-left py-2">Ubicación</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($ultimosTitulos as $titulo)
                                <tr class="border-t border-gray-100">
                                    <td class="py-2">
                                        <a href="{{ route('titulos-fisicos.show', $titulo) }}" class="text-pggl-700 hover:underline">{{ $titulo->numero_titulo }}</a>
                                    </td>
                                    <td class="py-2">{{ $titulo->titulacion->graduado->nombre_completo ?? '—' }}</td>
                                    <td class="py-2">
                                        <span class="px-2 py-1 rounded text-xs font-semibold
                                            {{ $titulo->ubicacion_actual === 'ENTREGADO' ? 'bg-green-100 text-green-800' : ($titulo->ubicacion_actual === 'IMPRENTA' ? 'bg-orange-100 text-orange-800' : ($titulo->ubicacion_actual === 'SETEC' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800')) }}">
                                            {{ $titulo->ubicacion_actual }}
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="py-2 text-gray-500">Sin títulos registrados.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Procesos recientes -->
                <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg p-6">
                    <h3 class="font-semibold text-lg mb-4">Procesos recientes</h3>
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr>
                                <th class="text-left py-2">Graduado</th>
                                <th class="text-left py-2">SLA</th>
                                <th class="text-left py-2">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($procesosRecientes as $proceso)
                                <tr class="border-t border-gray-100">
                                    <td class="py-2">
                                        <a href="{{ route('procesos-titulo.show', $proceso) }}" class="text-pggl-700 hover:underline">
                                            {{ $proceso->titulacion->graduado->nombre_completo ?? '—' }}
                                        </a>
                                    </td>
                                    <td class="py-2">
                                        @if ($proceso->slaVencido())
                                            <span class="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">Vencido</span>
                                        @elseif ($proceso->slaIniciado())
                                            <span class="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">{{ $proceso->diasRestantes() }} días</span>
                                        @else
                                            <span class="text-gray-400">No iniciado</span>
                                        @endif
                                    </td>
                                    <td class="py-2">
                                        @if ($proceso->finalizado())
                                            <span class="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Finalizado</span>
                                        @else
                                            <span class="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">En curso</span>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="py-2 text-gray-500">Sin procesos registrados.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
