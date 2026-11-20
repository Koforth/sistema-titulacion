<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TituloPublicoResource;
use App\Models\TituloFisico;
use Illuminate\Http\Request;

class ConsultaPublicaController extends Controller
{
    public function estadisticas(): array
    {
        $total = TituloFisico::count();
        $emitidos = TituloFisico::where('ubicacion_actual', 'ENTREGADO')->count();
        return [
            'titulos_emitidos' => $emitidos,
            'total_registrados' => $total,
            'titulos_en_tramite' => max(0, $total - $emitidos),
        ];
    }

    public function buscar(Request $request)
    {
        $data = $request->validate(['q' => ['required', 'string', 'min:3', 'max:100']]);
        $q = trim($data['q']);
        $qLimpia = preg_replace('/[^A-Za-z0-9]/', '', $q);

        $titulos = TituloFisico::with('titulacion.graduado')
            ->where(function ($w) use ($q, $qLimpia) {
                $w->where('numero_titulo', 'like', "%{$q}%")
                  ->orWhere('uuid', 'like', "%{$q}%")
                  ->orWhere('folio', 'like', "%{$q}%")
                  ->orWhereHas('titulacion', function ($t) use ($q, $qLimpia) {
                      $t->where('registrado_no', 'like', "%{$q}%")
                        ->orWhere('carrera', 'like', "%{$q}%")
                        ->orWhere('titulo_obtenido', 'like', "%{$q}%")
                        ->orWhereHas('graduado', function ($g) use ($q, $qLimpia) {
                            $g->where('nombre_completo', 'like', "%{$q}%")
                              ->orWhere('nombres', 'like', "%{$q}%")
                              ->orWhere('apellidos', 'like', "%{$q}%")
                              ->orWhere('carnet', 'like', "%{$q}%")
                              ->orWhere('cedula', 'like', "%{$q}%")
                              ->when(!empty($qLimpia), function ($query) use ($qLimpia) {
                                  $query->orWhereRaw("REPLACE(REPLACE(cedula, '-', ''), ' ', '') LIKE ?", ["%{$qLimpia}%"]);
                              });
                        });
                  });
            })
            ->limit(20)
            ->get();

        return TituloPublicoResource::collection($titulos);
    }

    public function verificar(string $uuid): TituloPublicoResource
    {
        $titulo = TituloFisico::with('titulacion.graduado')
            ->where('uuid', $uuid)
            ->orWhere('numero_titulo', $uuid)
            ->firstOrFail();

        return new TituloPublicoResource($titulo);
    }
}
