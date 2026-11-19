<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AcademicService
{
    /**
     * Busca un estudiante en la API académica externa (o simula respuesta si está en pruebas).
     */
    public function buscarEstudiante(string $identificador): array
    {
        $url = config('services.academic.url');
        $token = config('services.academic.token');

        // Si la API externa no está configurada aún en .env, devolvemos simulación format SETEC
        if (blank($url) || blank($token) || str_contains($url, 'ENDPOINT')) {
            return $this->simularEstudiante($identificador);
        }

        try {
            $response = Http::timeout(6)
                ->withToken($token)
                ->acceptJson()
                ->get(rtrim($url, '/').'/estudiantes/buscar', ['q' => $identificador]);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $e) {
            Log::warning("Error consultando API académica externa: {$e->getMessage()}");
        }

        return $this->simularEstudiante($identificador);
    }

    /**
     * Datos simulados basados en identificador (Cédula o Carné) para autocompletar la UI.
     */
    private function simularEstudiante(string $identificador): array
    {
        return [
            'encontrado' => true,
            'origen' => 'API Académica Externa (Simulado)',
            'estudiante' => [
                'tipo_identidad' => 'Cédula de Identidad Nicaragüense',
                'cedula' => str_contains($identificador, '-') ? $identificador : '441-230600-1010G',
                'carnet' => !str_contains($identificador, '-') ? $identificador : '22-09432-1',
                'nombres' => 'Anielka Lizeth',
                'apellidos' => 'Martínez Dávila',
                'nombre_completo' => 'Anielka Lizeth Martínez Dávila',
                'sexo' => 'Femenino',
                'pais' => 'Nicaragua',
                'estado_civil' => 'Soltero(a)',
                'etnia' => 'Mestizo',
                'departamento_origen' => 'León',
                'municipio_origen' => 'León',
                'departamento_residencia' => 'León',
                'municipio_residencia' => 'León',
                'direccion_residencia' => 'Costado sur de la Catedral de León 2c al lago',
                'email' => 'anielka.martinez@est.unanleon.edu.ni',
                'telefono' => '8899-7711',
                'linea_telefonica' => 'Claro',
                'anio_bachillerato' => '2019',
                'tipo_bachillerato' => 'Regular',
                'turno_bachillerato' => 'Matutino',
                'modalidad_bachillerato' => 'Presencial',
                // Datos académicos sugeridos para el título
                'carrera' => 'Licenciatura en Contaduría Pública y Finanzas',
                'titulo_obtenido' => 'Licenciada en Contaduría Pública y Finanzas',
                'anio_inicio_estudio' => '2020',
                'anio_fin_estudio' => '2024',
                'anio_graduacion' => '2024',
            ],
        ];
    }
}
