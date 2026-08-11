<?php

namespace Database\Factories;

use App\Models\Titulacion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TituloFisico>
 */
class TituloFisicoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titulacion_id' => Titulacion::factory(),
            'numero_titulo' => fake()->unique()->numerify('UNCP-2026-####'),
            'libro' => (string) fake()->numberBetween(1, 20),
            'tomo' => (string) fake()->numberBetween(1, 5),
            'folio' => (string) fake()->numberBetween(1, 300),
            'uuid' => (string) Str::uuid(),
            'qr' => null,
            'ubicacion_actual' => 'LEON',
            'calidad' => fake()->randomElement(['Buena', 'Regular', 'Dañado']),
            'observaciones' => null,
        ];
    }
}
