<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TituloFisicoRequest;
use App\Models\Titulacion;
use App\Models\TituloFisico;
use App\Services\HistorialTituloService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TituloFisicoController extends Controller
{
    public function __construct(private HistorialTituloService $historialSvc) {}

    public function index(Request $request)
    {
        return TituloFisico::with('titulacion.graduado')
            ->when($request->ubicacion, fn ($q, $u) => $q->where('ubicacion_actual', $u))
            ->when($request->q, function ($query, $q) {
                $query->where(fn ($w) => $w->where('numero_titulo', 'like', "%{$q}%")
                    ->orWhereHas('titulacion.graduado', fn ($g) => $g->where('nombre_completo', 'like', "%{$q}%")));
            })
            ->latest()
            ->paginate(15);
    }

    /** Titulaciones que aún no tienen título físico (para formularios de alta). */
    public function disponibles()
    {
        return Titulacion::with('graduado')->whereDoesntHave('tituloFisico')->orderBy('id')->get();
    }

    public function resumenUbicaciones(): JsonResponse
    {
        return response()->json([
            'leon' => TituloFisico::where('ubicacion_actual', 'LEON')->count(),
            'imprenta' => TituloFisico::where('ubicacion_actual', 'IMPRENTA')->count(),
            'setec' => TituloFisico::where('ubicacion_actual', 'SETEC')->count(),
            'entregado' => TituloFisico::where('ubicacion_actual', 'ENTREGADO')->count(),
            'total' => TituloFisico::count(),
        ]);
    }

    public function store(TituloFisicoRequest $request): JsonResponse
    {
        $titulo = TituloFisico::create($request->validated() + [
            'uuid' => (string) Str::uuid(),
            'ubicacion_actual' => 'LEON',
        ]);

        $this->historialSvc->registrar($titulo, 'Título creado', 'Se registró el documento físico en León.');

        return response()->json($titulo->load('titulacion.graduado'), 201);
    }

    public function show(TituloFisico $titulo)
    {
        return $titulo->load('titulacion.graduado', 'titulacion.proceso', 'historial.usuario');
    }

    /** La ubicación NO es editable manualmente. */
    public function update(TituloFisicoRequest $request, TituloFisico $titulo)
    {
        $titulo->update($request->validated());

        return $titulo;
    }

    public function historial(TituloFisico $titulo)
    {
        return $titulo->load('titulacion.graduado', 'historial.usuario');
    }

    public function regenerarQr(TituloFisico $titulo)
    {
        $titulo->update(['qr' => null]);
        $this->historialSvc->registrar($titulo, 'QR regenerado', 'Se regeneró el código QR del título.');

        return $titulo->fresh();
    }
}
