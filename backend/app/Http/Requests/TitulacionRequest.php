<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TitulacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'graduado_id' => ['required', 'exists:graduados,id'],
            'carrera' => ['required', 'string', 'max:191'],
            'fecha_titulacion' => ['nullable', 'date'],
            'modalidad' => ['nullable', 'string', 'max:191'],
        ];
    }
}
