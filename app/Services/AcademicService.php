<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AcademicService
{
    /**
     * Busca un estudiante en la API académica externa.
     *
     * NOTA: el endpoint real debe obtenerse de la documentación/Postman
     * de la API. Hasta entonces este método lanza un error claro.
     */
    public function buscarEstudiante(string $identificador): array
    {
        $url = config('services.academic.url');
        $token = config('services.academic.token');

        if (blank($url) || blank($token)) {
            abort(503, 'La API académica no está configurada. Verifique ACADEMIC_URL y ACADEMIC_TOKEN.');
        }

        return Http::timeout(10)
            ->withToken($token)
            ->acceptJson()
            ->get($url . '/ENDPOINT', ['identificador' => $identificador])
            ->throw()
            ->json();
    }
}
