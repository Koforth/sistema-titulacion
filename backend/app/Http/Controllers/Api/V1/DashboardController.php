<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Graduado;
use App\Models\ProcesoTitulo;
use App\Models\Titulacion;
use App\Models\TituloFisico;
use App\Services\ReporteService;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(ReporteService $reportes)
    {
        $count = fn (string $u) => TituloFisico::where('ubicacion_actual', $u)->count();

        $totalTitulos = TituloFisico::count();
        $entregados = $count('ENTREGADO');
        $enProceso = TituloFisico::where('ubicacion_actual', '!=', 'ENTREGADO')->count();
        $slaVencidos = $reportes->alertasSlaVencido()->count();
        $totalGraduados = Graduado::count();

        // 4 KPIs Clave
        $tasaCumplimiento = $totalTitulos > 0 
            ? round(($entregados / $totalTitulos) * 100, 1) 
            : 0;

        $kpis = [
            'total_titulos' => [
                'valor' => $totalTitulos,
                'label' => 'Total Títulos Registrados',
                'subtext' => "Graduados: {$totalGraduados}",
                'color' => 'blue',
            ],
            'en_proceso' => [
                'valor' => $enProceso,
                'label' => 'Títulos en Circulación',
                'subtext' => 'León, Imprenta y SETEC',
                'color' => 'orange',
            ],
            'entregados' => [
                'valor' => $entregados,
                'label' => 'Títulos Entregados',
                'subtext' => "Tasa éxito: {$tasaCumplimiento}%",
                'color' => 'green',
            ],
            'sla_vencido' => [
                'valor' => $slaVencidos,
                'label' => 'Alertas SLA (+45 días)',
                'subtext' => $slaVencidos > 0 ? 'Requieren atención urgente' : 'Todos en tiempo',
                'color' => $slaVencidos > 0 ? 'red' : 'green',
            ],
        ];

        // Gráfico 1: Títulos por Ubicación Física (Donut / Pie)
        $ubicaciones = [
            ['name' => 'En León', 'value' => $count('LEON'), 'color' => '#3b82f6'],
            ['name' => 'En Imprenta', 'value' => $count('IMPRENTA'), 'color' => '#f97316'],
            ['name' => 'En SETEC', 'value' => $count('SETEC'), 'color' => '#a855f7'],
            ['name' => 'Entregados', 'value' => $entregados, 'color' => '#22c55e'],
        ];

        // Gráfico 2: Top Carreras con más Titulaciones (Barras)
        $carreras = Titulacion::select('carrera', DB::raw('count(*) as total'))
            ->groupBy('carrera')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'name' => $r->carrera,
                'value' => (int) $r->total,
            ]);

        // Gráfico 3: Estado del Flujo / Pipeline de Procesos (Etapas)
        $flujoProcesos = [
            ['etapa' => 'Solicitud', 'total' => ProcesoTitulo::where('solicitado_estudiante', true)->count()],
            ['etapa' => 'Expediente', 'total' => ProcesoTitulo::where('expediente_completo', true)->count()],
            ['etapa' => 'Elaboración', 'total' => ProcesoTitulo::where('elaboracion_titulo', true)->count()],
            ['etapa' => 'Certificación', 'total' => ProcesoTitulo::where('doc_certificacion', true)->count()],
            ['etapa' => 'Entregado', 'total' => ProcesoTitulo::where('titulo_entregado_graduado', true)->count()],
        ];

        return [
            'kpis' => $kpis,
            'graficos' => [
                'ubicaciones' => $ubicaciones,
                'carreras' => $carreras,
                'flujo_procesos' => $flujoProcesos,
            ],
            'counts' => [
                'en_proceso' => $enProceso,
                'en_imprenta' => $count('IMPRENTA'),
                'en_setec' => $count('SETEC'),
                'en_leon' => $count('LEON'),
                'entregados' => $entregados,
                'sla_vencido' => $slaVencidos,
            ],
            'ultimos_titulos' => TituloFisico::with('titulacion.graduado')->latest()->limit(6)->get(),
            'procesos_recientes' => ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')->latest()->limit(6)->get(),
            'servidor_tiempo' => now()->toISOString(),
        ];
    }
}
