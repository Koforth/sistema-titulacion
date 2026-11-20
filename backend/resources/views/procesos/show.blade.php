<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Proceso de {{ $proceso->titulacion->graduado->nombre_completo }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <dl class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <dt class="font-medium text-gray-500">Graduado</dt>
                        <dd>{{ $proceso->titulacion->graduado->nombre_completo }}</dd>
                    </div>
                    <div>
                        <dt class="font-medium text-gray-500">Carrera</dt>
                        <dd>{{ $proceso->titulacion->carrera }}</dd>
                    </div>
                    <div>
                        <dt class="font-medium text-gray-500">Inicio SLA</dt>
                        <dd>{{ $proceso->fecha_inicio_sla?->format('d/m/Y') ?? '—' }}</dd>
                    </div>
                    <div>
                        <dt class="font-medium text-gray-500">Límite SLA</dt>
                        <dd>{{ $proceso->fecha_limite_sla?->format('d/m/Y') ?? '—' }}</dd>
                    </div>
                </dl>

                @if ($proceso->slaVencido())
                    <div class="mt-4 px-4 py-3 bg-red-100 border border-red-400 text-red-800 rounded">
                        <strong>Alerta:</strong> el plazo de 45 días ha vencido y el título aún no ha sido entregado al graduado.
                    </div>
                @elseif ($proceso->slaIniciado())
                    <div class="mt-4 px-4 py-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                        Quedan <strong>{{ $proceso->diasRestantes() }} días</strong> para el vencimiento del SLA.
                    </div>
                @endif
            </div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4">Etapas</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @foreach ($etapas as $clave => $etiqueta)
                        <form method="POST" action="{{ route('procesos-titulo.marcar-etapa', $proceso) }}" class="flex items-center justify-between p-3 border rounded-lg">
                            @csrf
                            <input type="hidden" name="etapa" value="{{ $clave }}">
                            <span class="text-sm">{{ $etiqueta }}</span>
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox"
                                       name="valor"
                                       value="1"
                                       {{ $proceso->{$clave} ? 'checked' : '' }}
                                       onchange="this.form.submit()"
                                       {{ $proceso->finalizado() && $clave !== 'titulo_entregado_graduado' ? 'disabled' : '' }}
                                       class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500">
                            </label>
                        </form>
                    @endforeach
                </div>
            </div>

            <div class="mt-6 flex gap-3">
                @if ($proceso->titulacion->tituloFisico)
                    <a href="{{ route('titulos-fisicos.historial', $proceso->titulacion->tituloFisico) }}" class="text-blue-600 hover:underline text-sm">
                        Ver hoja de vida del título
                    </a>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
