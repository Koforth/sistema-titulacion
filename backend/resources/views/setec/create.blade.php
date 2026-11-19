<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Nuevo lote SETEC</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                @include('partials.flash')

                <form method="POST" action="{{ route('setec.store') }}" class="space-y-4">
                    @csrf

                    <div>
                        <x-input-label value="Títulos disponibles en León" />
                        <p class="text-xs text-gray-500 mb-2">Seleccione los títulos que se enviarán a SETEC para certificación.</p>
                        @forelse ($titulos as $titulo)
                            <label class="flex items-center gap-3 p-2 border rounded-lg mb-2 cursor-pointer">
                                <input type="checkbox" name="titulos[]" value="{{ $titulo->id }}"
                                       class="rounded border-gray-300 text-blue-600 shadow-sm">
                                <span class="text-sm">
                                    <strong>{{ $titulo->numero_titulo }}</strong> — {{ $titulo->titulacion->graduado->nombre_completo }}
                                    ({{ $titulo->titulacion->carrera }})
                                </span>
                            </label>
                        @empty
                            <p class="text-sm text-gray-500">No hay títulos disponibles en León.</p>
                        @endforelse
                        <x-input-error :messages="$errors->get('titulos')" class="mt-2" />
                    </div>

                    <div>
                        <x-input-label for="observaciones" value="Observaciones" />
                        <textarea id="observaciones" name="observaciones" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">{{ old('observaciones') }}</textarea>
                        <x-input-error :messages="$errors->get('observaciones')" class="mt-2" />
                    </div>

                    <div class="flex items-center gap-3">
                        <x-primary-button>Enviar a SETEC</x-primary-button>
                        <a href="{{ route('setec.index') }}" class="text-sm text-gray-600 hover:underline">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
