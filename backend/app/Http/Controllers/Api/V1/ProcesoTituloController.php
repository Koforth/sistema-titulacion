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
        return ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')
            ->when($request->q, function ($query, $q) {
                $query->whereHas('titulacion.graduado', fn ($w) => $w->where('nombre_completo', 'like', "%{$q}%"));
            })
            ->latest()
            ->paginate(15);
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
