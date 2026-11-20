<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TituloFisico;
use App\Services\EntregaService;
use Illuminate\Http\Request;

class EntregaController extends Controller
{
    public function __construct(private EntregaService $entregaSvc) {}

    public function index()
    {
        return TituloFisico::with('titulacion.graduado')
            ->where('ubicacion_actual', '!=', 'ENTREGADO')
            ->orderBy('numero_titulo')
            ->paginate(15);
    }

    public function show(TituloFisico $titulo)
    {
        return $titulo->load('titulacion.graduado', 'titulacion.proceso');
    }

    public function entregar(Request $request, TituloFisico $titulo)
    {
        $data = $request->validate(['observaciones' => ['nullable', 'string']]);
        $this->entregaSvc->entregar($titulo, $data['observaciones'] ?? null);

        return $titulo->fresh();
    }
}
