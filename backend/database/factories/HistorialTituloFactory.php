<?php

namespace Database\Factories;

use App\Models\HistorialTitulo;
use App\Models\TituloFisico;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HistorialTitulo>
 */
class HistorialTituloFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titulo_fisico_id' => TituloFisico::factory(),
            'tipo_evento' => 'Título creado',
            'fecha' => now(),
            'usuario_id' => User::factory(),
            'descripcion' => null,
        ];
    }
}
