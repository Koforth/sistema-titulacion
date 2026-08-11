<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Graduados</h2>
            <a href="{{ route('graduados.create') }}" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                Nuevo graduado
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <form method="GET" action="{{ route('graduados.index') }}" class="mb-4">
                <input type="text" name="q" value="{{ request('q') }}" placeholder="Buscar por nombre, carnet o cédula..."
                    class="w-full rounded-md border-gray-300 shadow-sm">
            </form>

            <div class="bg-white overflow-x-auto shadow-sm sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Nombre</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Carnet</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Cédula</th>
                            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Titulaciones</th>
                            <th class="px-6 py-3 text-right font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($graduados as $graduado)
                            <tr>
                                <td class="px-6 py-3">
                                    <a href="{{ route('graduados.show', $graduado) }}" class="text-blue-600 hover:underline">{{ $graduado->nombre_completo }}</a>
                                </td>
                                <td class="px-6 py-3">{{ $graduado->carnet ?? '—' }}</td>
                                <td class="px-6 py-3">{{ $graduado->cedula ?? '—' }}</td>
                                <td class="px-6 py-3">{{ $graduado->titulaciones_count }}</td>
                                <td class="px-6 py-3 text-right space-x-2">
                                    <a href="{{ route('graduados.edit', $graduado) }}" class="text-indigo-600 hover:underline">Editar</a>
                                    <form method="POST" action="{{ route('graduados.destroy', $graduado) }}" class="inline" onsubmit="return confirm('¿Eliminar este graduado?')">
                                        @csrf @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:underline">Eliminar</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay graduados registrados.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">{{ $graduados->links() }}</div>
        </div>
    </div>
</x-app-layout>
