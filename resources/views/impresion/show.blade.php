<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Lote {{ $lote->numero_lote }}</h2>
            <a href="{{ route('impresion.index') }}" class="text-gray-600 hover:underline text-sm">Volver</a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><dt class="font-medium text-gray-500">Número de lote</dt><dd>{{ $lote->numero_lote }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Estado</dt><dd>{{ $lote->estado }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Fecha envío</dt><dd>{{ $lote->fecha_envio?->format('d/m/Y H:i') ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Responsable envío</dt><dd>{{ $lote->responsableEnvio?->name ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Fecha retorno</dt><dd>{{ $lote->fecha_retorno?->format('d/m/Y H:i') ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Responsable recepción</dt><dd>{{ $lote->responsableRecepcion?->name ?? '—' }}</dd></div>
                    <div class="md:col-span-2"><dt class="font-medium text-gray-500">Observaciones</dt><dd>{{ $lote->observaciones ?? '—' }}</dd></div>
                </dl>
            </div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <h3 class="font-semibold text-lg mb-4">Títulos del lote</h3>
                <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left font-medium text-gray-500 uppercase">Número</th>
                            <th class="px-4 py-2 text-left font-medium text-gray-500 uppercase">Graduado</th>
                            <th class="px-4 py-2 text-left font-medium text-gray-500 uppercase">Ubicación</th>
                            <th class="px-4 py-2 text-left font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($lote->detalle as $item)
                            <tr>
                                <td class="px-4 py-2">
                                    <a href="{{ route('titulos-fisicos.show', $item->tituloFisico) }}" class="text-blue-600 hover:underline">{{ $item->tituloFisico->numero_titulo }}</a>
                                </td>
                                <td class="px-4 py-2">{{ $item->tituloFisico->titulacion->graduado->nombre_completo }}</td>
                                <td class="px-4 py-2">{{ $item->tituloFisico->ubicacion_actual }}</td>
                                <td class="px-4 py-2">{{ $item->estado }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Sin títulos en el lote.</td></tr>
                        @endforelse
                    </tbody>
                </table>
                </div>
            </div>

            @if ($lote->estado === 'ENVIADO')
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 class="font-semibold text-lg mb-4">Registrar retorno de imprenta</h3>
                    <form method="POST" action="{{ route('impresion.retorno', $lote) }}" class="space-y-4">
                        @csrf
                        <div>
                            <x-input-label for="observaciones" value="Observaciones del retorno" />
                            <textarea id="observaciones" name="observaciones" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                        </div>
                        <x-primary-button>Registrar retorno</x-primary-button>
                    </form>
                </div>
            @endif
        </div>
    </div>
</x-app-layout>
