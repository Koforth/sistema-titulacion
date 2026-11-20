<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProcesoTitulo;
use App\Models\Titulacion;
use App\Services\ProcesoTituloService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcesoTituloController extends Controller
{
    public function __construct(private ProcesoTituloService $procesoSvc) {}

    public function index(Request $request)
    {
        $query = ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')
            ->when($request->q, function ($qBuilder, $q) {
                $qBuilder->where(function ($sub) use ($q) {
                    $sub->whereHas('titulacion.graduado', function ($w) use ($q) {
                        $w->where('nombre_completo', 'like', "%{$q}%")
                          ->orWhere('cedula', 'like', "%{$q}%")
                          ->orWhere('carnet', 'like', "%{$q}%");
                    })->orWhereHas('titulacion', function ($w) use ($q) {
                        $w->where('carrera', 'like', "%{$q}%");
                    });
                });
            })
            ->when($request->estado, function ($qBuilder, $estado) {
                if ($estado === 'finalizado') {
                    $qBuilder->where('titulo_entregado_graduado', true);
                } elseif ($estado === 'en_tiempo') {
                    $qBuilder->where('titulo_entregado_graduado', false)
                             ->where(function ($sub) {
                                 $sub->whereNull('fecha_limite_sla')
                                     ->orWhere('fecha_limite_sla', '>=', now()->addDays(10));
                             });
                } elseif ($estado === 'proximo_vencer') {
                    $qBuilder->where('titulo_entregado_graduado', false)
                             ->whereNotNull('fecha_limite_sla')
                             ->whereBetween('fecha_limite_sla', [now(), now()->addDays(10)]);
                } elseif ($estado === 'vencido') {
                    $qBuilder->where('titulo_entregado_graduado', false)
                             ->whereNotNull('fecha_limite_sla')
                             ->where('fecha_limite_sla', '<', now());
                }
            });

        return $query->latest()->paginate(15);
    }

    public function stats(): JsonResponse
    {
        $ahora = now();
        $total = ProcesoTitulo::count();
        $finalizados = ProcesoTitulo::where('titulo_entregado_graduado', true)->count();
        $enTramite = ProcesoTitulo::where('titulo_entregado_graduado', false)->count();
        $vencidos = ProcesoTitulo::where('titulo_entregado_graduado', false)
            ->whereNotNull('fecha_limite_sla')
            ->where('fecha_limite_sla', '<', $ahora)
            ->count();
        $enAlerta = ProcesoTitulo::where('titulo_entregado_graduado', false)
            ->whereNotNull('fecha_limite_sla')
            ->whereBetween('fecha_limite_sla', [$ahora, $ahora->copy()->addDays(10)])
            ->count();

        return response()->json([
            'total' => $total,
            'en_tramite' => $enTramite,
            'en_alerta' => $enAlerta,
            'vencidos' => $vencidos,
            'finalizados' => $finalizados,
            'etapas' => ProcesoTituloService::ETAPAS,
        ]);
    }

    public function show(ProcesoTitulo $proceso)
    {
        return [
            'proceso' => $proceso->load('titulacion.graduado', 'titulacion.tituloFisico'),
            'etapas' => ProcesoTituloService::ETAPAS,
        ];
    }

    public function crearParaTitulacion(Titulacion $titulacion): JsonResponse
    {
        if ($titulacion->proceso) {
            return response()->json(['message' => 'La titulación ya tiene un proceso.', 'proceso' => $titulacion->proceso], 409);
        }

        $proceso = ProcesoTitulo::create(['titulacion_id' => $titulacion->id, 'pendiente' => true]);

        return response()->json($proceso, 201);
    }

    public function marcarEtapa(Request $request, ProcesoTitulo $proceso): JsonResponse
    {
        $data = $request->validate([
            'etapa' => ['required', 'string'],
            'valor' => ['required', 'boolean'],
        ]);

        if ($proceso->finalizado()) {
            return response()->json(['message' => 'El proceso ya está finalizado.'], 409);
        }

        $this->procesoSvc->marcarEtapa($proceso, $data['etapa'], $data['valor']);

        return response()->json($proceso->fresh());
    }
}
