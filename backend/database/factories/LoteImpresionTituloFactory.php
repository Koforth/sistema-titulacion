<?php

namespace Database\Factories;

use App\Models\LoteImpresion;
use App\Models\LoteImpresionTitulo;
use App\Models\TituloFisico;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoteImpresionTitulo>
 */
class LoteImpresionTituloFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lote_impresion_id' => LoteImpresion::factory(),
            'titulo_fisico_id' => TituloFisico::factory(),
            'estado' => 'ENVIADO',
            'observacion' => null,
        ];
    }
}
