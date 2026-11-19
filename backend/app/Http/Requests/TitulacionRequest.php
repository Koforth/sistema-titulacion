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
            'titulo_obtenido' => ['nullable', 'string', 'max:191'],
            'anio_inicio_estudio' => ['nullable', 'string', 'max:10'],
            'anio_fin_estudio' => ['nullable', 'string', 'max:10'],
            'anio_graduacion' => ['nullable', 'string', 'max:10'],
            'registrado_no' => ['nullable', 'string', 'max:100'],
            'folio' => ['nullable', 'string', 'max:100'],
            'tomo_registro' => ['nullable', 'string', 'max:100'],
            'fecha_emision_titulo' => ['nullable', 'date'],
            'sede' => ['nullable', 'string', 'max:100'],
            'duracion_anios' => ['nullable', 'string', 'max:20'],
            'numero_asignaturas' => ['nullable', 'string', 'max:20'],
            'programa_especial' => ['nullable', 'string', 'max:100'],
            'forma_culminacion' => ['nullable', 'string', 'max:100'],
            'numero_gaceta' => ['nullable', 'string', 'max:100'],
            'pagina_gaceta' => ['nullable', 'string', 'max:100'],
            'fecha_gaceta' => ['nullable', 'date'],
            'acceso_internet' => ['nullable', 'boolean'],
            'tipo_acceso_internet' => ['nullable', 'string', 'max:100'],
            'empresa_acceso_internet' => ['nullable', 'string', 'max:100'],
            'fecha_registro_setec' => ['nullable', 'date'],
            'registrador' => ['nullable', 'string', 'max:191'],
            'fecha_titulacion' => ['nullable', 'date'],
            'modalidad' => ['nullable', 'string', 'max:191'],
            'estado' => ['nullable', 'string', 'max:50'],
        ];
    }
}
