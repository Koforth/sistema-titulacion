<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Editar graduado</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <form method="POST" action="{{ route('graduados.update', $graduado) }}" class="space-y-4">
                    @csrf @method('PATCH')

                    <div>
                        <x-input-label for="nombre_completo" value="Nombre completo" />
                        <x-text-input id="nombre_completo" name="nombre_completo" class="mt-1 block w-full" value="{{ old('nombre_completo', $graduado->nombre_completo) }}" required />
                        <x-input-error :messages="$errors->get('nombre_completo')" class="mt-2" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <x-input-label for="carnet" value="Carnet" />
                            <x-text-input id="carnet" name="carnet" class="mt-1 block w-full" value="{{ old('carnet', $graduado->carnet) }}" />
                            <x-input-error :messages="$errors->get('carnet')" class="mt-2" />
                        </div>
                        <div>
                            <x-input-label for="cedula" value="Cédula" />
                            <x-text-input id="cedula" name="cedula" class="mt-1 block w-full" value="{{ old('cedula', $graduado->cedula) }}" />
                            <x-input-error :messages="$errors->get('cedula')" class="mt-2" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <x-input-label for="email" value="Email" />
                            <x-text-input id="email" name="email" type="email" class="mt-1 block w-full" value="{{ old('email', $graduado->email) }}" />
                            <x-input-error :messages="$errors->get('email')" class="mt-2" />
                        </div>
                        <div>
                            <x-input-label for="telefono" value="Teléfono" />
                            <x-text-input id="telefono" name="telefono" class="mt-1 block w-full" value="{{ old('telefono', $graduado->telefono) }}" />
                            <x-input-error :messages="$errors->get('telefono')" class="mt-2" />
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <x-primary-button>Guardar</x-primary-button>
                        <a href="{{ route('graduados.index') }}" class="text-sm text-gray-600 hover:underline">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
