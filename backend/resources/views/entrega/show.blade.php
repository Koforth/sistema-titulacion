<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Entregar título {{ $titulo->numero_titulo }}</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><dt class="font-medium text-gray-500">Graduado</dt><dd>{{ $titulo->titulacion->graduado->nombre_completo }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Carrera</dt><dd>{{ $titulo->titulacion->carrera }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Número de título</dt><dd>{{ $titulo->numero_titulo }}</dd></div>
                    <div><dt class="font-medium text-gray-500">Ubicación actual</dt><dd>{{ $titulo->ubicacion_actual }}</dd></div>
                </dl>
            </div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <div class="mb-4 px-4 py-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
                    Al entregar, el título pasará a ubicación <strong>ENTREGADO</strong> y el proceso de titulación quedará finalizado.
                </div>

                <form method="POST" action="{{ route('entrega.entregar', $titulo) }}" class="space-y-4">
                    @csrf
                    <div>
                        <x-input-label for="observaciones" value="Observaciones de la entrega" />
                        <textarea id="observaciones" name="observaciones" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                        <x-input-error :messages="$errors->get('observaciones')" class="mt-2" />
                    </div>
                    <div class="flex items-center gap-3">
                        <x-primary-button>Confirmar entrega</x-primary-button>
                        <a href="{{ route('entrega.index') }}" class="text-sm text-gray-600 hover:underline">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
