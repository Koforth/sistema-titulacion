<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Entrega al graduado</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Número</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Graduado</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Carrera</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Ubicación</th>
                            <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($titulos as $titulo)
                            <tr>
                                <td class="px-6 py-3">{{ $titulo->numero_titulo }}</td>
                                <td class="px-6 py-3">{{ $titulo->titulacion->graduado->nombre_completo }}</td>
                                <td class="px-6 py-3">{{ $titulo->titulacion->carrera }}</td>
                                <td class="px-6 py-3">
                                    <span class="px-2 py-1 rounded text-xs font-semibold
                                        {{ $titulo->ubicacion_actual === 'IMPRENTA' ? 'bg-orange-100 text-orange-800' : ($titulo->ubicacion_actual === 'SETEC' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800') }}">
                                        {{ $titulo->ubicacion_actual }}
                                    </span>
                                </td>
                                <td class="px-6 py-3 text-right">
                                    @if ($titulo->estaEn('LEON'))
                                        <a href="{{ route('entrega.show', $titulo) }}" class="text-blue-600 hover:underline">Entregar</a>
                                    @else
                                        <span class="text-xs text-gray-400">Solo en León</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay títulos pendientes de entrega.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">{{ $titulos->links() }}</div>
        </div>
    </div>
</x-app-layout>
