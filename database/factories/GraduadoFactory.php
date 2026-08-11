<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Graduado>
 */
class GraduadoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'carnet' => strtoupper(fake()->unique()->bothify('####-#####')),
            'cedula' => fake()->unique()->numerify('###-######-#####'),
            'nombre_completo' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'telefono' => fake()->numerify('########'),
        ];
    }
}
