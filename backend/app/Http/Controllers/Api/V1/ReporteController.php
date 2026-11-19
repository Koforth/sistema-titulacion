<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReporteService;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    private const TIPOS = [
        'en_imprenta' => 'Títulos en imprenta',
        'en_setec' => 'Títulos en SETEC',
        'en_leon' => 'Títulos en León',
        'entregados' => 'Títulos entregados',
        'en_proceso' => 'Títulos en proceso',
        'sla_vencido' => 'Alertas: más de 45 días',
    ];

    public function __invoke(Request $request, ReporteService $reportes)
    {
        $tipo = $request->query('tipo', 'en_leon');

        abort_unless(isset(self::TIPOS[$tipo]), 422, 'Tipo de reporte inválido.');

        $ubicaciones = ['en_imprenta' => 'IMPRENTA', 'en_setec' => 'SETEC', 'en_leon' => 'LEON', 'entregados' => 'ENTREGADO'];

        $data = match (true) {
            isset($ubicaciones[$tipo]) => ['titulos' => $reportes->porUbicacion($ubicaciones[$tipo])],
            $tipo === 'en_proceso' => ['titulos' => $reportes->enProceso()],
            default => ['procesos' => $reportes->alertasSlaVencido()],
        };

        return ['tipo' => $tipo, 'tipos' => self::TIPOS] + $data;
    }
}
