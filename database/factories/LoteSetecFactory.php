<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LoteSetec>
 */
class LoteSetecFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'numero_lote' => 'SETEC-' . now()->year . '-' . str_pad((string) fake()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'fecha_envio' => now(),
            'responsable_envio_id' => User::factory(),
            'fecha_retorno' => null,
            'responsable_recepcion_id' => null,
            'estado' => 'ENVIADO',
            'observaciones' => null,
        ];
    }
}
