<?php

namespace App\Http\Controllers;

use App\Models\ProcesoTitulo;
use App\Models\TituloFisico;
use App\Services\ReporteService;

class DashboardController extends Controller
{
    public function __invoke(ReporteService $reportes)
    {
        $counts = [
            'en_proceso' => TituloFisico::where('ubicacion_actual', '!=', 'ENTREGADO')->count(),
            'en_imprenta' => TituloFisico::where('ubicacion_actual', 'IMPRENTA')->count(),
            'en_setec' => TituloFisico::where('ubicacion_actual', 'SETEC')->count(),
            'en_leon' => TituloFisico::where('ubicacion_actual', 'LEON')->count(),
            'entregados' => TituloFisico::where('ubicacion_actual', 'ENTREGADO')->count(),
            'sla_vencido' => $reportes->alertasSlaVencido()->count(),
        ];

        $ultimosTitulos = TituloFisico::with('titulacion.graduado')
            ->latest()
            ->limit(8)
            ->get();

        $procesosRecientes = ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')
            ->latest()
            ->limit(8)
            ->get();

        return view('dashboard', compact('counts', 'ultimosTitulos', 'procesosRecientes'));
    }
}
