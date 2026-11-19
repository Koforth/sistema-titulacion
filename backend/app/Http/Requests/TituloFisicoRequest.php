<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TituloFisicoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'numero_titulo' => ['required', 'string', 'max:191'],
            'libro' => ['nullable', 'string', 'max:191'],
            'tomo' => ['nullable', 'string', 'max:191'],
            'folio' => ['nullable', 'string', 'max:191'],
            'calidad' => ['nullable', 'string', 'max:191'],
            'observaciones' => ['nullable', 'string'],
        ];

        if ($this->isMethod('POST')) {
            $rules['titulacion_id'] = ['required', 'exists:titulaciones,id'];
        }

        return $rules;
    }
}
