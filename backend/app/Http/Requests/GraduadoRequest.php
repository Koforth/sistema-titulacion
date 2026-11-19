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
            'carnet' => ['nullable', 'string', 'max:191'],
            'cedula' => ['nullable', 'string', 'max:191'],
            'nombre_completo' => ['required', 'string', 'max:191'],
            'email' => ['nullable', 'email', 'max:191'],
            'telefono' => ['nullable', 'string', 'max:191'],
        ];
    }
}
