<?php

namespace App\Http\Controllers;

use App\Models\TituloFisico;
use App\Services\EntregaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class EntregaController extends Controller
{
    public function __construct(
        private EntregaService $entregaSvc,
    ) {}

    public function index(): View
    {
        $titulos = TituloFisico::with('titulacion.graduado')
            ->where('ubicacion_actual', '!=', 'ENTREGADO')
            ->orderBy('numero_titulo')
            ->paginate(15);

        return view('entrega.index', compact('titulos'));
    }

    public function show(TituloFisico $titulo): View
    {
        $titulo->load('titulacion.graduado', 'titulacion.proceso');

        return view('entrega.show', compact('titulo'));
    }

    public function entregar(Request $request, TituloFisico $titulo): RedirectResponse
    {
        $data = $request->validate([
            'observaciones' => ['nullable', 'string'],
        ]);

        $this->entregaSvc->entregar($titulo, $data['observaciones'] ?? null);

        return redirect()->route('entrega.index')->with('success', 'Título entregado al graduado correctamente.');
    }
}
