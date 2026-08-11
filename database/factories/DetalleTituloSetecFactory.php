<?php

namespace Database\Factories;

use App\Models\LoteSetec;
use App\Models\TituloFisico;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DetalleTituloSetec>
 */
class DetalleTituloSetecFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lote_setec_id' => LoteSetec::factory(),
            'titulo_fisico_id' => TituloFisico::factory(),
            'estado' => 'PENDIENTE',
            'observacion' => null,
            'fecha_certificacion' => null,
        ];
    }
}
