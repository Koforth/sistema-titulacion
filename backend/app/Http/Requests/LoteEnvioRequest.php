<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoteEnvioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulos' => ['required', 'array', 'min:1'],
            'titulos.*' => ['exists:titulos_fisicos,id'],
            'observaciones' => ['nullable', 'string'],
        ];
    }
}
