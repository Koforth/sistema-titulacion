<?php

namespace App\Http\Controllers;

use App\Services\ReporteService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ReporteController extends Controller
{
    public function index(Request $request, ReporteService $reportes): View
    {
        $tipo = $request->query('tipo', 'en_leon');

        $tipos = [
            'en_imprenta' => 'Títulos en imprenta',
            'en_setec' => 'Títulos en SETEC',
            'en_leon' => 'Títulos en León',
            'entregados' => 'Títulos entregados',
            'en_proceso' => 'Títulos en proceso',
            'sla_vencido' => 'Alertas: más de 45 días',
        ];

        $titulos = collect();
        $procesos = collect();

        switch ($tipo) {
            case 'en_imprenta':
            case 'en_setec':
            case 'en_leon':
            case 'entregados':
                $ubicacion = match ($tipo) {
                    'en_imprenta' => 'IMPRENTA',
                    'en_setec' => 'SETEC',
                    'en_leon' => 'LEON',
                    'entregados' => 'ENTREGADO',
                };
                $titulos = $reportes->porUbicacion($ubicacion);
                break;
            case 'en_proceso':
                $titulos = $reportes->enProceso();
                break;
            case 'sla_vencido':
                $procesos = $reportes->alertasSlaVencido();
                break;
        }

        return view('reportes.index', compact('tipo', 'tipos', 'titulos', 'procesos'));
    }
}
