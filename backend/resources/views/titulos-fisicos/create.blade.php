<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Nuevo título físico</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                @include('partials.flash')

                <form method="POST" action="{{ route('titulos-fisicos.store') }}" class="space-y-4">
                    @csrf

                    <div>
                        <x-input-label for="titulacion_id" value="Titulación" />
                        <select id="titulacion_id" name="titulacion_id" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Seleccione una titulación sin título físico...</option>
                            @foreach ($titulaciones as $titulacion)
                                <option value="{{ $titulacion->id }}" {{ old('titulacion_id') == $titulacion->id ? 'selected' : '' }}>
                                    #{{ $titulacion->id }} — {{ $titulacion->graduado->nombre_completo }} ({{ $titulacion->carrera }})
                                </option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('titulacion_id')" class="mt-2" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <x-input-label for="numero_titulo" value="Número de título" />
                            <x-text-input id="numero_titulo" name="numero_titulo" class="mt-1 block w-full" required />
                            <x-input-error :messages="$errors->get('numero_titulo')" class="mt-2" />
                        </div>
                        <div>
                            <x-input-label for="calidad" value="Calidad" />
                            <select id="calidad" name="calidad" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="">Seleccione...</option>
                                @foreach (['Buena', 'Regular', 'Dañado'] as $calidad)
                                    <option value="{{ $calidad }}" {{ old('calidad') === $calidad ? 'selected' : '' }}>{{ $calidad }}</option>
                                @endforeach
                            </select>
                            <x-input-error :messages="$errors->get('calidad')" class="mt-2" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <x-input-label for="libro" value="Libro" />
                            <x-text-input id="libro" name="libro" class="mt-1 block w-full" />
                            <x-input-error :messages="$errors->get('libro')" class="mt-2" />
                        </div>
                        <div>
                            <x-input-label for="tomo" value="Tomo" />
                            <x-text-input id="tomo" name="tomo" class="mt-1 block w-full" />
                            <x-input-error :messages="$errors->get('tomo')" class="mt-2" />
                        </div>
                        <div>
                            <x-input-label for="folio" value="Folio" />
                            <x-text-input id="folio" name="folio" class="mt-1 block w-full" />
                            <x-input-error :messages="$errors->get('folio')" class="mt-2" />
                        </div>
                    </div>

                    <div>
                        <x-input-label for="observaciones" value="Observaciones" />
                        <textarea id="observaciones" name="observaciones" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">{{ old('observaciones') }}</textarea>
                        <x-input-error :messages="$errors->get('observaciones')" class="mt-2" />
                    </div>

                    <div class="flex items-center gap-3">
                        <x-primary-button>Guardar</x-primary-button>
                        <a href="{{ route('titulos-fisicos.index') }}" class="text-sm text-gray-600 hover:underline">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
