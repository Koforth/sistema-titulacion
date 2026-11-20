<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoteEnvioRequest;
use App\Models\LoteImpresion;
use App\Models\TituloFisico;
use App\Services\LoteImpresionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoteImpresionController extends Controller
{
    public function __construct(private LoteImpresionService $loteSvc) {}

    public function index()
    {
        return LoteImpresion::with('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio')->latest()->paginate(15);
    }

    /** Títulos disponibles (en León) para armar un lote. */
    public function disponibles()
    {
        return TituloFisico::with('titulacion.graduado')->where('ubicacion_actual', 'LEON')->get();
    }

    public function store(LoteEnvioRequest $request): JsonResponse
    {
        $data = $request->validated();
        $lote = $this->loteSvc->enviar($data['titulos'], $data['observaciones'] ?? null);

        return response()->json($lote->load('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio'), 201);
    }

    public function show(LoteImpresion $lote)
    {
        return $lote->load('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio', 'responsableRecepcion');
    }

    public function registrarRetorno(Request $request, LoteImpresion $lote)
    {
        $data = $request->validate(['observaciones' => ['nullable', 'string']]);
        $this->loteSvc->registrarRetorno($lote, $data['observaciones'] ?? null);

        return $lote->fresh(['detalle.tituloFisico.titulacion.graduado', 'responsableEnvio', 'responsableRecepcion']);
    }
}
