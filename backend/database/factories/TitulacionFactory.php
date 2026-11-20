<?php

namespace Database\Factories;

use App\Models\Graduado;
use App\Models\Titulacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Titulacion>
 */
class TitulacionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'graduado_id' => Graduado::factory(),
            'carrera' => fake()->randomElement([
                'Ingeniería en Sistemas',
                'Ingeniería Industrial',
                'Medicina',
                'Derecho',
                'Administración de Empresas',
                'Contaduría Pública',
            ]),
            'fecha_titulacion' => fake()->date(),
            'modalidad' => fake()->randomElement(['Tesis', 'Seminario', 'Curso de grado', 'Examen de grado']),
            'estado' => 'pendiente',
        ];
    }
}
