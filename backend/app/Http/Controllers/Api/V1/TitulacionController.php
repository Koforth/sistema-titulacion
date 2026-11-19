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
            ->when($request->q, function ($query, $q) {
                $query->whereHas('graduado', fn ($w) => $w->where('nombre_completo', 'like', "%{$q}%")
                    ->orWhere('carnet', 'like', "%{$q}%"));
            })
            ->latest()
            ->paginate(15);
    }

    public function store(TitulacionRequest $request): JsonResponse
    {
        $titulacion = Titulacion::create($request->validated() + ['estado' => 'pendiente']);

        return response()->json($titulacion->load('graduado'), 201);
    }

    public function show(Titulacion $titulacion)
    {
        return $titulacion->load('graduado', 'proceso', 'tituloFisico');
    }

    public function update(TitulacionRequest $request, Titulacion $titulacion)
    {
        $titulacion->update($request->validated());

        return $titulacion->load('graduado');
    }

    public function destroy(Titulacion $titulacion): JsonResponse
    {
        $titulacion->delete();

        return response()->json(null, 204);
    }
}
