<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">{{ $graduado->nombre_completo }}</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><dt class="font-medium text-gray-500">Carnet</dt><dd>{{ $graduado->carnet ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Cédula</dt><dd>{{ $graduado->cedula ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Email</dt><dd>{{ $graduado->email ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Teléfono</dt><dd>{{ $graduado->telefono ?? '—' }}</dd></div>
                </dl>
                <div class="mt-4">
                    <a href="{{ route('graduados.edit', $graduado) }}" class="text-indigo-600 hover:underline text-sm">Editar</a>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4">Titulaciones</h3>
                <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left font-medium text-gray-500 uppercase">Carrera</th>
                            <th class="px-4 py-2 text-left font-medium text-gray-500 uppercase">Fecha</th>
                            <th class="px-4 py-2 text-left font-medium text-gray-500 uppercase">Estado</th>
                            <th class="px-4 py-2 text-right font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse ($graduado->titulaciones as $titulacion)
                            <tr>
                                <td class="px-4 py-2">{{ $titulacion->carrera }}</td>
                                <td class="px-4 py-2">{{ $titulacion->fecha_titulacion?->format('d/m/Y') ?? '—' }}</td>
                                <td class="px-4 py-2">{{ $titulacion->estado }}</td>
                                <td class="px-4 py-2 text-right">
                                    <a href="{{ route('titulaciones.show', $titulacion) }}" class="text-blue-600 hover:underline">Ver</a>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Sin titulaciones.</td></tr>
                        @endforelse
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
