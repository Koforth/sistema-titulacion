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

        // Estructura de evidencias documentales oficiales (SETEC)
        $evidenciasGuardadas = $titulacion?->evidencias ?: [];
        $requisitosCatalogo = [
            1 => ['nombre' => 'Cédula de Identidad', 'categoria' => 'General', 'icono' => '🆔', 'archivo_def' => "Cedula_Identidad_{$this->numero_titulo}.pdf", 'size_def' => '1.2 MB'],
            2 => ['nombre' => 'Diploma de Bachiller', 'categoria' => 'Pregrado / Grado', 'icono' => '🎓', 'archivo_def' => "Diploma_Bachiller_MINED_{$this->numero_titulo}.pdf", 'size_def' => '2.4 MB'],
            3 => ['nombre' => 'Certificado de Notas', 'categoria' => 'General', 'icono' => '📊', 'archivo_def' => "Certificado_Notas_Oficial_{$this->numero_titulo}.pdf", 'size_def' => '3.1 MB'],
            4 => ['nombre' => 'Plan de Estudio', 'categoria' => 'General', 'icono' => '📚', 'archivo_def' => "Plan_Estudios_Aprobado_{$this->numero_titulo}.pdf", 'size_def' => '1.8 MB'],
            5 => ['nombre' => 'Título Otorgado', 'categoria' => 'General', 'icono' => '📜', 'archivo_def' => "Copia_Titulo_Oficial_{$this->numero_titulo}.pdf", 'size_def' => '4.2 MB'],
            6 => ['nombre' => 'Título de Grado', 'categoria' => 'Posgrado', 'icono' => '🏛️', 'archivo_def' => "Titulo_Pregrado_Previo_{$this->numero_titulo}.pdf", 'size_def' => '2.0 MB'],
            7 => ['nombre' => 'Acta de Defensa de Culminación', 'categoria' => 'General', 'icono' => '⚖️', 'archivo_def' => "Acta_Defensa_Sustentacion_{$this->numero_titulo}.pdf", 'size_def' => '1.6 MB'],
            8 => ['nombre' => 'Página de La Gaceta', 'categoria' => 'General', 'icono' => '📰', 'archivo_def' => "Publicacion_La_Gaceta_{$this->numero_titulo}.pdf", 'size_def' => '950 KB'],
        ];

        $evidencias = [];
        foreach ($requisitosCatalogo as $id => $info) {
            $archivoCustom = $evidenciasGuardadas[$id] ?? null;
            $nombreArchivo = is_array($archivoCustom) ? ($archivoCustom['name'] ?? $info['archivo_def']) : (is_string($archivoCustom) ? $archivoCustom : $info['archivo_def']);
            $size = is_array($archivoCustom) ? ($archivoCustom['size'] ?? $info['size_def']) : $info['size_def'];
            $disponible = !empty($archivoCustom) || $esEntregado;

            $evidencias[] = [
                'id' => $id,
                'requisito' => $info['nombre'],
                'categoria' => $info['categoria'],
                'icono' => $info['icono'],
                'nombre_archivo' => $nombreArchivo,
                'size' => $size,
                'disponible' => $disponible,
                'tipo' => 'PDF',
            ];
        }

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
            'evidencias' => $evidencias,
            'total_evidencias' => count(array_filter($evidencias, fn ($e) => $e['disponible'])),
        ];
    }
}
