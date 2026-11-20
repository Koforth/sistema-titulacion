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
        return [
            'titulos_emitidos' => TituloFisico::where('ubicacion_actual', 'ENTREGADO')->count(),
            'total_registrados' => TituloFisico::count(),
        ];
    }

    public function buscar(Request $request)
    {
        $data = $request->validate(['q' => ['required', 'string', 'min:3', 'max:100']]);
        $q = $data['q'];

        $titulos = TituloFisico::with('titulacion.graduado')
            ->where('ubicacion_actual', 'ENTREGADO')
            ->where(fn ($w) => $w->where('numero_titulo', 'like', "%{$q}%")
                ->orWhereHas('titulacion.graduado', fn ($g) => $g->where('nombre_completo', 'like', "%{$q}%")))
            ->limit(25)
            ->get();

        return TituloPublicoResource::collection($titulos);
    }

    public function verificar(string $uuid): TituloPublicoResource
    {
        return new TituloPublicoResource(
            TituloFisico::with('titulacion.graduado')->where('uuid', $uuid)->firstOrFail()
        );
    }
}
