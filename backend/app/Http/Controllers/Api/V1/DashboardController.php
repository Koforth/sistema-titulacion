<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProcesoTitulo;
use App\Models\TituloFisico;
use App\Services\ReporteService;

class DashboardController extends Controller
{
    public function __invoke(ReporteService $reportes)
    {
        $count = fn (string $u) => TituloFisico::where('ubicacion_actual', $u)->count();

        return [
            'counts' => [
                'en_proceso' => TituloFisico::where('ubicacion_actual', '!=', 'ENTREGADO')->count(),
                'en_imprenta' => $count('IMPRENTA'),
                'en_setec' => $count('SETEC'),
                'en_leon' => $count('LEON'),
                'entregados' => $count('ENTREGADO'),
                'sla_vencido' => $reportes->alertasSlaVencido()->count(),
            ],
            'ultimos_titulos' => TituloFisico::with('titulacion.graduado')->latest()->limit(8)->get(),
            'procesos_recientes' => ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')->latest()->limit(8)->get(),
        ];
    }
}
