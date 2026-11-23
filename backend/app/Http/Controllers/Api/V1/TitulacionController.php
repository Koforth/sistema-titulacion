<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TitulacionRequest;
use App\Models\Titulacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TitulacionController extends Controller
{
    public function index(Request $request)
    {
        return Titulacion::with('graduado', 'proceso', 'tituloFisico')
            ->when($request->graduado_id, fn ($q, $gid) => $q->where('graduado_id', $gid))
            ->when($request->documento, function ($query, $doc) {
                $query->whereHas('graduado', fn ($w) => $w->where('cedula', 'like', "%{$doc}%")
                    ->orWhere('carnet', 'like', "%{$doc}%"));
            })
            ->when($request->nombres, function ($query, $n) {
                $query->whereHas('graduado', fn ($w) => $w->where('nombres', 'like', "%{$n}%")
                    ->orWhere('nombre_completo', 'like', "%{$n}%"));
            })
            ->when($request->apellidos, function ($query, $a) {
                $query->whereHas('graduado', fn ($w) => $w->where('apellidos', 'like', "%{$a}%")
                    ->orWhere('nombre_completo', 'like', "%{$a}%"));
            })
            ->when($request->q, function ($query, $q) {
                $query->where(function ($w) use ($q) {
                    $w->where('carrera', 'like', "%{$q}%")
                      ->orWhere('titulo_obtenido', 'like', "%{$q}%")
                      ->orWhere('registrado_no', 'like', "%{$q}%")
                      ->orWhereHas('graduado', fn ($g) => $g->where('nombre_completo', 'like', "%{$q}%")
                          ->orWhere('carnet', 'like', "%{$q}%")
                          ->orWhere('cedula', 'like', "%{$q}%"));
                });
            })
            ->latest()
            ->paginate(15);
    }

    public function store(TitulacionRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (empty($data['estado'])) {
            $data['estado'] = 'pendiente';
        }

        $titulacion = Titulacion::create($data);

        return response()->json($titulacion->load('graduado'), 201);
    }

    public function show(Titulacion $titulacion)
    {
        return $titulacion->load('graduado', 'proceso', 'tituloFisico');
    }

    public function update(TitulacionRequest $request, Titulacion $titulacion)
    {
        $titulacion->update($request->validated());

        if ($titulacion->tituloFisico) {
            $titulacion->tituloFisico->update([
                'tomo' => $titulacion->tomo_registro ?: $titulacion->tituloFisico->tomo,
                'folio' => $titulacion->folio ?: $titulacion->tituloFisico->folio,
            ]);
        }

        return $titulacion->load('graduado', 'tituloFisico');
    }

    public function destroy(Titulacion $titulacion): JsonResponse
    {
        $titulacion->delete();

        return response()->json(null, 204);
    }
}
