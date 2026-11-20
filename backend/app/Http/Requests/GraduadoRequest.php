<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GraduadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_identidad' => ['nullable', 'string', 'max:50'],
            'carnet' => ['nullable', 'string', 'max:191'],
            'cedula' => ['nullable', 'string', 'max:191'],
            'nombres' => ['nullable', 'string', 'max:191'],
            'apellidos' => ['nullable', 'string', 'max:191'],
            'nombre_completo' => ['required', 'string', 'max:191'],
            'sexo' => ['nullable', 'string', 'max:20'],
            'pais' => ['nullable', 'string', 'max:100'],
            'estado_civil' => ['nullable', 'string', 'max:50'],
            'etnia' => ['nullable', 'string', 'max:50'],
            'departamento_origen' => ['nullable', 'string', 'max:100'],
            'municipio_origen' => ['nullable', 'string', 'max:100'],
            'departamento_residencia' => ['nullable', 'string', 'max:100'],
            'municipio_residencia' => ['nullable', 'string', 'max:100'],
            'direccion_residencia' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:191'],
            'telefono' => ['nullable', 'string', 'max:191'],
            'anio_bachillerato' => ['nullable', 'string', 'max:10'],
            'tipo_bachillerato' => ['nullable', 'string', 'max:50'],
            'turno_bachillerato' => ['nullable', 'string', 'max:50'],
            'modalidad_bachillerato' => ['nullable', 'string', 'max:50'],
        ];
    }
}
