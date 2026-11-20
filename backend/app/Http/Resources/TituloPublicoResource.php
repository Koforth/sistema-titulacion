<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Minimización de datos personales (ISO 27001 A.5.34): la consulta pública
 * solo expone lo estrictamente necesario para verificar un título.
 */
class TituloPublicoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'numero_titulo' => $this->numero_titulo,
            'estado' => $this->ubicacion_actual === 'ENTREGADO' ? 'ENTREGADO' : 'EN_PROCESO',
            'graduado' => $this->titulacion?->graduado?->nombre_completo,
            'carrera' => $this->titulacion?->carrera,
            'fecha_titulacion' => $this->titulacion?->fecha_titulacion,
        ];
    }
}
