<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GraduadoRequest;
use App\Models\Graduado;
use App\Services\AcademicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GraduadoController extends Controller
{
    public function __construct(private AcademicService $academicSvc)
    {
    }

    /**
     * Consulta a la API Académica externa por documento de identidad o carnet.
     */
    public function buscarApiExterna(Request $request): JsonResponse
    {
        $identificador = $request->query('q') ?? $request->query('identificador');
        if (empty($identificador)) {
            return response()->json(['message' => 'Debe ingresar un número de cédula o carnet para consultar la API académica.'], 422);
        }

        $resultado = $this->academicSvc->buscarEstudiante($identificador);

        return response()->json($resultado);
    }
    public function index(Request $request)
    {
        return Graduado::query()
            ->withCount('titulaciones')
            ->when($request->q, function ($query, $q) {
                $query->where(fn ($w) => $w->where('nombre_completo', 'like', "%{$q}%")
                    ->orWhere('carnet', 'like', "%{$q}%")
                    ->orWhere('cedula', 'like', "%{$q}%")
                    ->orWhere('nombres', 'like', "%{$q}%")
                    ->orWhere('apellidos', 'like', "%{$q}%"));
            })
            ->when($request->documento, function ($query, $doc) {
                $query->where(fn ($w) => $w->where('cedula', 'like', "%{$doc}%")
                    ->orWhere('carnet', 'like', "%{$doc}%"));
            })
            ->when($request->nombres, fn ($q, $n) => $q->where('nombres', 'like', "%{$n}%"))
            ->when($request->apellidos, fn ($q, $a) => $q->where('apellidos', 'like', "%{$a}%"))
            ->orderBy('id', 'desc')
            ->paginate(15);
    }

    public function store(GraduadoRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Autocompletar nombre_completo si se enviaron nombres y apellidos separados
        if (empty($data['nombre_completo']) && (!empty($data['nombres']) || !empty($data['apellidos']))) {
            $data['nombre_completo'] = trim(($data['nombres'] ?? '') . ' ' . ($data['apellidos'] ?? ''));
        }

        return response()->json(Graduado::create($data), 201);
    }

    public function show(Graduado $graduado)
    {
        return $graduado->load('titulaciones.tituloFisico', 'titulaciones.proceso');
    }

    public function update(GraduadoRequest $request, Graduado $graduado)
    {
        $data = $request->validated();
        if (empty($data['nombre_completo']) && (!empty($data['nombres']) || !empty($data['apellidos']))) {
            $data['nombre_completo'] = trim(($data['nombres'] ?? '') . ' ' . ($data['apellidos'] ?? ''));
        }

        $graduado->update($data);

        return $graduado;
    }

    public function destroy(Graduado $graduado): JsonResponse
    {
        $graduado->delete();

        return response()->json(null, 204);
    }
}
