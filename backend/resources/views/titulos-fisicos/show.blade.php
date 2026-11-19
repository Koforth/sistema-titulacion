<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Título: {{ $titulo->numero_titulo }}</h2>
            <div class="flex gap-3">
                <a href="{{ route('titulos-fisicos.historial', $titulo) }}" class="text-indigo-600 hover:underline text-sm">Ver hoja de vida</a>
                <a href="{{ route('titulos-fisicos.edit', $titulo) }}" class="text-gray-600 hover:underline text-sm">Editar</a>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            @include('partials.flash')

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><dt class="font-medium text-gray-500">Graduado</dt><dd>{{ $titulo->titulacion->graduado->nombre_completo }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Carrera</dt><dd>{{ $titulo->titulacion->carrera }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Número de título</dt><dd>{{ $titulo->numero_titulo }}</dd></div>
                    <div>
                        <dt class="font-medium text-gray-500">Ubicación actual</dt>
                        <dd>
                            <span class="px-2 py-1 rounded text-xs font-semibold
                                {{ $titulo->ubicacion_actual === 'ENTREGADO' ? 'bg-green-100 text-green-800' : ($titulo->ubicacion_actual === 'IMPRENTA' ? 'bg-orange-100 text-orange-800' : ($titulo->ubicacion_actual === 'SETEC' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800')) }}">
                                {{ $titulo->ubicacion_actual }}
                            </span>
                            <p class="text-xs text-gray-400 mt-1">Se actualiza automáticamente por eventos.</p>
                        </dd>
                    </div>
                    <div><dt class="font-medium text-gray-500">Libro / Tomo / Folio</dt><dd>{{ $titulo->libro ?? '—' }} / {{ $titulo->tomo ?? '—' }} / {{ $titulo->folio ?? '—' }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Calidad</dt><dd>{{ $titulo->calidad ?? '—' }}</dd></div>
                    <div class="md:col-span-2"><dt class="font-medium text-gray-500">Observaciones</dt><dd>{{ $titulo->observaciones ?? '—' }}</dd></div>
                </dl>
            </div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <h3 class="font-semibold text-lg mb-4">QR de verificación</h3>
                <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div class="text-center shrink-0">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode(route('consulta-publica.verificar', $titulo->uuid)) }}"
                             alt="QR del título" class="border rounded">
                        <p class="text-xs text-gray-500 mt-2">{{ $titulo->uuid }}</p>
                    </div>
                    <div class="text-sm space-y-2">
                        <p>URL pública de verificación:</p>
                        <code class="block bg-gray-100 p-2 rounded text-xs break-all">{{ route('consulta-publica.verificar', $titulo->uuid) }}</code>
                        <form method="POST" action="{{ route('titulos-fisicos.regenerar-qr', $titulo) }}">
                            @csrf
                            <button type="submit" class="text-indigo-600 hover:underline text-sm">Regenerar QR</button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4">Proceso asociado</h3>
                @if ($titulo->titulacion->proceso)
                    <p>
                        <a href="{{ route('procesos-titulo.show', $titulo->titulacion->proceso) }}" class="text-blue-600 hover:underline">
                            Ver proceso de titulación
                        </a>
                    </p>
                @else
                    <p class="text-gray-500 text-sm">Sin proceso de titulación asociado.</p>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
