<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Titulaciones</h2>
            <a href="{{ route('titulaciones.create') }}" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                Nueva titulación
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <form method="GET" action="{{ route('titulaciones.index') }}" class="mb-4">
                <input type="text" name="q" value="{{ request('q') }}" placeholder="Buscar por graduado o carnet..."
                    class="w-full rounded-md border-gray-300 shadow-sm">
            </form>

            <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Graduado</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Carrera</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Fecha</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Proceso</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Título físico</th>
                            <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($titulaciones as $titulacion)
                            <tr>
                                <td class="px-6 py-3">
                                    <a href="{{ route('titulaciones.show', $titulacion) }}" class="text-blue-600 hover:underline">{{ $titulacion->graduado->nombre_completo }}</a>
                                </td>
                                <td class="px-6 py-3">{{ $titulacion->carrera }}</td>
                                <td class="px-6 py-3">{{ $titulacion->fecha_titulacion?->format('d/m/Y') ?? '—' }}</td>
                                <td class="px-6 py-3">
                                    @if ($titulacion->proceso)
                                        <a href="{{ route('procesos-titulo.show', $titulacion->proceso) }}" class="text-indigo-600 hover:underline">Ver proceso</a>
                                    @else
                                        <form method="POST" action="{{ route('procesos-titulo.crear', $titulacion) }}">
                                            @csrf
                                            <button type="submit" class="text-green-600 hover:underline">Crear proceso</button>
                                        </form>
                                    @endif
                                </td>
                                <td class="px-6 py-3">
                                    @if ($titulacion->tituloFisico)
                                        <a href="{{ route('titulos-fisicos.show', $titulacion->tituloFisico) }}" class="text-blue-600 hover:underline">{{ $titulacion->tituloFisico->numero_titulo }}</a>
                                    @else
                                        <span class="text-gray-400">Sin título</span>
                                    @endif
                                </td>
                                <td class="px-6 py-3 text-right space-x-2">
                                    <a href="{{ route('titulaciones.edit', $titulacion) }}" class="text-indigo-600 hover:underline">Editar</a>
                                    <form method="POST" action="{{ route('titulaciones.destroy', $titulacion) }}" class="inline" onsubmit="return confirm('¿Eliminar esta titulación?')">
                                        @csrf @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:underline">Eliminar</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay titulaciones registradas.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">{{ $titulaciones->links() }}</div>
        </div>
    </div>
</x-app-layout>
