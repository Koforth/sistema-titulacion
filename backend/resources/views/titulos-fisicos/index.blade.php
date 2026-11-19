<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Títulos físicos</h2>
            <a href="{{ route('titulos-fisicos.create') }}" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                Nuevo título físico
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <form method="GET" action="{{ route('titulos-fisicos.index') }}" class="mb-4 flex flex-col sm:flex-row gap-2">
                <input type="text" name="q" value="{{ request('q') }}" placeholder="Buscar por número o graduado..."
                    class="flex-1 rounded-md border-gray-300 shadow-sm">
                <select name="ubicacion" class="rounded-md border-gray-300 shadow-sm" onchange="this.form.submit()">
                    <option value="">Todas las ubicaciones</option>
                    @foreach (['LEON', 'IMPRENTA', 'SETEC', 'ENTREGADO'] as $ubicacion)
                        <option value="{{ $ubicacion }}" {{ request('ubicacion') === $ubicacion ? 'selected' : '' }}>{{ $ubicacion }}</option>
                    @endforeach
                </select>
            </form>

            <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Número</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Graduado</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Libro/Tomo/Folio</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Ubicación</th>
                            <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($titulos as $titulo)
                            <tr>
                                <td class="px-6 py-3">
                                    <a href="{{ route('titulos-fisicos.show', $titulo) }}" class="text-blue-600 hover:underline">{{ $titulo->numero_titulo }}</a>
                                </td>
                                <td class="px-6 py-3">{{ $titulo->titulacion->graduado->nombre_completo }}</td>
                                <td class="px-6 py-3">{{ $titulo->libro ?? '—' }}/{{ $titulo->tomo ?? '—' }}/{{ $titulo->folio ?? '—' }}</td>
                                <td class="px-6 py-3">
                                    <span class="px-2 py-1 rounded text-xs font-semibold
                                        {{ $titulo->ubicacion_actual === 'ENTREGADO' ? 'bg-green-100 text-green-800' : ($titulo->ubicacion_actual === 'IMPRENTA' ? 'bg-orange-100 text-orange-800' : ($titulo->ubicacion_actual === 'SETEC' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800')) }}">
                                        {{ $titulo->ubicacion_actual }}
                                    </span>
                                </td>
                                <td class="px-6 py-3 text-right space-x-3">
                                    <a href="{{ route('titulos-fisicos.historial', $titulo) }}" class="text-indigo-600 hover:underline">Hoja de vida</a>
                                    <a href="{{ route('titulos-fisicos.edit', $titulo) }}" class="text-gray-600 hover:underline">Editar</a>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay títulos físicos.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">{{ $titulos->links() }}</div>
        </div>
    </div>
</x-app-layout>
