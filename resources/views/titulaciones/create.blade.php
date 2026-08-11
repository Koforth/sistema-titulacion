<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Nueva titulación</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <form method="POST" action="{{ route('titulaciones.store') }}" class="space-y-4">
                    @csrf

                    <div>
                        <x-input-label for="graduado_id" value="Graduado" />
                        <select id="graduado_id" name="graduado_id" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Seleccione...</option>
                            @foreach ($graduados as $graduado)
                                <option value="{{ $graduado->id }}" {{ old('graduado_id') == $graduado->id ? 'selected' : '' }}>
                                    {{ $graduado->nombre_completo }} ({{ $graduado->carnet ?? 'sin carnet' }})
                                </option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('graduado_id')" class="mt-2" />
                    </div>

                    <div>
                        <x-input-label for="carrera" value="Carrera" />
                        <x-text-input id="carrera" name="carrera" class="mt-1 block w-full" required />
                        <x-input-error :messages="$errors->get('carrera')" class="mt-2" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <x-input-label for="fecha_titulacion" value="Fecha de titulación" />
                            <x-text-input id="fecha_titulacion" name="fecha_titulacion" type="date" class="mt-1 block w-full" />
                            <x-input-error :messages="$errors->get('fecha_titulacion')" class="mt-2" />
                        </div>
                        <div>
                            <x-input-label for="modalidad" value="Modalidad" />
                            <select id="modalidad" name="modalidad" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="">Seleccione...</option>
                                @foreach (['Tesis', 'Seminario', 'Curso de grado', 'Examen de grado'] as $modalidad)
                                    <option value="{{ $modalidad }}" {{ old('modalidad') === $modalidad ? 'selected' : '' }}>{{ $modalidad }}</option>
                                @endforeach
                            </select>
                            <x-input-error :messages="$errors->get('modalidad')" class="mt-2" />
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <x-primary-button>Guardar</x-primary-button>
                        <a href="{{ route('titulaciones.index') }}" class="text-sm text-gray-600 hover:underline">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
