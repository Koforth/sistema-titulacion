<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Impresión  lotes</h2>
            <a href="{{ route('impresion.create') }}" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                Nuevo envío a imprenta
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Lote</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Fecha envío</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Responsable envío</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Fecha retorno</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Estado</th>
                            <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($lotes as $lote)
                            <tr>
                                <td class="px-6 py-3">
                                    <a href="{{ route('impresion.show', $lote) }}" class="text-blue-600 hover:underline">{{ $lote->numero_lote }}</a>
                                </td>
                                <td class="px-6 py-3">{{ $lote->fecha_envio?->format('d/m/Y H:i') ?? '—' }}</td>
                                <td class="px-6 py-3">{{ $lote->responsableEnvio?->name ?? '—' }}</td>
                                <td class="px-6 py-3">{{ $lote->fecha_retorno?->format('d/m/Y H:i') ?? '—' }}</td>
                                <td class="px-6 py-3">
                                    <span class="px-2 py-1 rounded text-xs font-semibold {{ $lote->estado === 'RETORNADO' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800' }}">
                                        {{ $lote->estado }}
                                    </span>
                                </td>
                                <td class="px-6 py-3 text-right">
                                    <a href="{{ route('impresion.show', $lote) }}" class="text-blue-600 hover:underline">Ver</a>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay lotes de impresión.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">{{ $lotes->links() }}</div>
        </div>
    </div>
</x-app-layout>
