<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GraduadoRequest;
use App\Models\Graduado;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GraduadoController extends Controller
{
    public function index(Request $request)
    {
        return Graduado::query()
            ->withCount('titulaciones')
            ->when($request->q, function ($query, $q) {
                $query->where(fn ($w) => $w->where('nombre_completo', 'like', "%{$q}%")
                    ->orWhere('carnet', 'like', "%{$q}%")
                    ->orWhere('cedula', 'like', "%{$q}%"));
            })
            ->orderBy('nombre_completo')
            ->paginate(15);
    }

    public function store(GraduadoRequest $request): JsonResponse
    {
        return response()->json(Graduado::create($request->validated()), 201);
    }

    public function show(Graduado $graduado)
    {
        return $graduado->load('titulaciones');
    }

    public function update(GraduadoRequest $request, Graduado $graduado)
    {
        $graduado->update($request->validated());

        return $graduado;
    }

    public function destroy(Graduado $graduado): JsonResponse
    {
        $graduado->delete();

        return response()->json(null, 204);
    }
}
