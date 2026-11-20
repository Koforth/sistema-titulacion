<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Titulacion;
use App\Services\ReporteService;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    private const TIPOS = [
        // 5 Reportes Institucionales Oficiales
        'padron_graduados' => '1. Padrón Oficial de Graduados y Titulados',
        'libro_registro' => '2. Libro Oficial de Registro (Tomo y Folio)',
        'custodia_lotes' => '3. Histórico de Custodia y Lotes (Imprenta/SETEC)',
        'auditoria_sla' => '4. Auditoría de SLA de 45 Días',
        'incidencias_setec' => '5. Incidencias y Observaciones SETEC',

        // Reportes por ubicación operativa (retrocompatibilidad)
        'en_leon' => 'Títulos en León',
        'en_imprenta' => 'Títulos en Imprenta Managua',
        'en_setec' => 'Títulos en SETEC Managua',
        'entregados' => 'Títulos Entregados al Graduado',
        'en_proceso' => 'Títulos en Proceso',
        'sla_vencido' => 'Alertas: SLA Vencido',
    ];

    public function __invoke(Request $request, ReporteService $reportes)
    {
        $tipo = $request->query('tipo', 'padron_graduados');
        $carrera = $request->query('carrera');
        $desde = $request->query('desde');
        $hasta = $request->query('hasta');
        $q = $request->query('q');

        abort_unless(isset(self::TIPOS[$tipo]), 422, 'Tipo de reporte inválido.');

        $ubicaciones = [
            'en_imprenta' => 'IMPRENTA',
            'en_setec' => 'SETEC',
            'en_leon' => 'LEON',
            'entregados' => 'ENTREGADO',
        ];

        $data = match ($tipo) {
            'padron_graduados' => ['padron' => $reportes->padronGraduados($carrera, $desde, $hasta, $q)],
            'libro_registro' => ['libro' => $reportes->libroRegistro($desde, $hasta, $q)],
            'custodia_lotes' => ['lotes' => $reportes->custodiaLotes($request->query('tipo_lote'))],
            'auditoria_sla' => ['procesos' => $reportes->auditoriaSla($carrera)],
            'incidencias_setec' => ['incidencias' => $reportes->incidenciasSetec()],
            'en_proceso' => ['titulos' => $reportes->enProceso()],
            'sla_vencido' => ['procesos' => $reportes->alertasSlaVencido()],
            default => isset($ubicaciones[$tipo])
                ? ['titulos' => $reportes->porUbicacion($ubicaciones[$tipo])]
                : ['procesos' => $reportes->alertasSlaVencido()],
        };

        // Lista de carreras disponibles en la BD para el filtro desplegable
        $carreras = Titulacion::distinct()->whereNotNull('carrera')->pluck('carrera')->values();

        return response()->json([
            'tipo' => $tipo,
            'tipos' => self::TIPOS,
            'carreras' => $carreras,
            'filtros' => [
                'carrera' => $carrera,
                'desde' => $desde,
                'hasta' => $hasta,
                'q' => $q,
            ],
            'generado_el' => now()->toIso8601String(),
        ] + $data);
    }
}
