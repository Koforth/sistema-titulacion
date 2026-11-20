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
        $titulacion = $this->titulacion;
        $graduado = $titulacion?->graduado;

        // Enmascaramiento de cédula para cumplimiento de privacidad (ISO 27001 A.5.34)
        $cedula = $graduado?->cedula;
        $cedulaEnmascarada = null;
        if ($cedula && strlen($cedula) >= 10) {
            $prefijo = substr($cedula, 0, 3);
            $sufijo = substr($cedula, -4);
            $cedulaEnmascarada = "{$prefijo}-******-{$sufijo}";
        }

        $esEntregado = $this->ubicacion_actual === 'ENTREGADO';

        return [
            'uuid' => $this->uuid,
            'numero_titulo' => $this->numero_titulo,
            'estado' => $esEntregado ? 'ENTREGADO' : 'EN_PROCESO',
            'estado_label' => $esEntregado ? 'Título Emitido y Vigente' : 'En Proceso de Emisión',
            'ubicacion_actual' => $this->ubicacion_actual,
            'graduado' => $graduado?->nombre_completo,
            'cedula_enmascarada' => $cedulaEnmascarada,
            'carrera' => $titulacion?->carrera,
            'titulo_obtenido' => $titulacion?->titulo_obtenido ?: $titulacion?->carrera,
            'sede' => $titulacion?->sede ?: 'Sede Central - León',
            'tomo' => $this->tomo ?: $titulacion?->tomo_registro ?: 'I',
            'folio' => $this->folio ?: $titulacion?->folio ?: '—',
            'registrado_no' => $titulacion?->registrado_no ?: $this->numero_titulo,
            'fecha_emision_titulo' => $titulacion?->fecha_emision_titulo ?: $titulacion?->fecha_titulacion,
            'fecha_registro_setec' => $titulacion?->fecha_registro_setec,
            'qr' => $this->qr,
            'sello_seguridad' => strtoupper(substr(hash('sha256', "UNCPGGL-{$this->uuid}-{$this->numero_titulo}"), 0, 16)),
            'fecha_consulta' => now()->format('d/m/Y H:i:s'),
        ];
    }
}
