<?php

namespace Database\Factories;

use App\Models\Titulacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProcesoTitulo>
 */
class ProcesoTituloFactory extends Factory
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
            'solicitado_estudiante' => false,
            'expediente_completo' => false,
            'elaboracion_bd' => false,
            'elaboracion_titulo' => false,
            'doc_certificacion' => false,
            'en_gaceta' => false,
            'titulo_entregado_graduado' => false,
            'titulo_anulado' => false,
            'titulo_rechazado' => false,
            'otro' => false,
            'pendiente' => true,
            'en_revision' => false,
            'revisado' => false,
            'validado' => false,
            'entregado_estudiante' => false,
        ];
    }
}
