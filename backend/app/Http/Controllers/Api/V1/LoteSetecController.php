<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoteEnvioRequest;
use App\Models\DetalleTituloSetec;
use App\Models\LoteSetec;
use App\Models\TituloFisico;
use App\Services\LoteSetecService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoteSetecController extends Controller
{
    public function __construct(private LoteSetecService $loteSvc) {}

    public function index()
    {
        return LoteSetec::with('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio')->latest()->paginate(15);
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

        return response()->json($lote->load('detalle.tituloFisico'), 201);
    }

    public function show(LoteSetec $lote)
    {
        return $lote->load('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio', 'responsableRecepcion');
    }

    public function registrarRetorno(Request $request, LoteSetec $lote)
    {
        $data = $request->validate(['observaciones' => ['nullable', 'string']]);
        $this->loteSvc->registrarRetorno($lote, $data['observaciones'] ?? null);

        return $lote->fresh();
    }

    public function registrarCertificacion(Request $request, DetalleTituloSetec $detalle)
    {
        $data = $request->validate([
            'estado' => ['required', 'in:CERTIFICADO,OBSERVADO,NO_RECIBIDO'],
            'observacion' => ['nullable', 'string'],
        ]);

        $this->loteSvc->registrarCertificacion($detalle, $data['estado'], $data['observacion'] ?? null);

        return $detalle->fresh();
    }
}
