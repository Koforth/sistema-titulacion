<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Procesos de titulación</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <form method="GET" action="{{ route('procesos-titulo.index') }}" class="mb-4">
                <input type="text" name="q" value="{{ request('q') }}" placeholder="Buscar por graduado..."
                    class="w-full rounded-md border-gray-300 shadow-sm">
            </form>

            <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Graduado</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Carrera</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">SLA 45 días</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Etapa clave</th>
                            <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($procesos as $proceso)
                            <tr>
                                <td class="px-6 py-3">
                                    <a href="{{ route('procesos-titulo.show', $proceso) }}" class="text-blue-600 hover:underline">
                                        {{ $proceso->titulacion->graduado->nombre_completo }}
                                    </a>
                                </td>
                                <td class="px-6 py-3">{{ $proceso->titulacion->carrera }}</td>
                                <td class="px-6 py-3">
                                    @if ($proceso->slaVencido())
                                        <span class="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">Vencido</span>
                                    @elseif ($proceso->slaIniciado())
                                        <span class="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">{{ $proceso->diasRestantes() }} días restantes</span>
                                    @else
                                        <span class="text-gray-400">No iniciado</span>
                                    @endif
                                </td>
                                <td class="px-6 py-3">
                                    @php
                                        $etapaActual = collect([
                                            $proceso->solicitado_estudiante => 'Solicitado',
                                            $proceso->expediente_completo => 'Expediente completo',
                                            $proceso->elaboracion_bd => 'Elab. base de datos',
                                            $proceso->elaboracion_titulo => 'Elab. título',
                                            $proceso->doc_certificacion => 'Doc. certificación',
                                            $proceso->en_gaceta => 'En gaceta',
                                            $proceso->titulo_entregado_graduado => 'Entregado al graduado',
                                        ])->last();
                                    @endphp
                                    {{ $etapaActual ?? 'Pendiente' }}
                                </td>
                                <td class="px-6 py-3 text-right">
                                    <a href="{{ route('procesos-titulo.show', $proceso) }}" class="text-blue-600 hover:underline">Ver</a>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay procesos registrados.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">{{ $procesos->links() }}</div>
        </div>
    </div>
</x-app-layout>
