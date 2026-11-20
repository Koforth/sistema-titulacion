<?php

namespace App\Http\Controllers;

use App\Models\LoteImpresion;
use App\Models\TituloFisico;
use App\Services\LoteImpresionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class LoteImpresionController extends Controller
{
    public function __construct(
        private LoteImpresionService $loteSvc,
    ) {}

    public function index(): View
    {
        $lotes = LoteImpresion::with('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio')
            ->latest()
            ->paginate(15);

        return view('impresion.index', compact('lotes'));
    }

    public function create(): View
    {
        $titulos = TituloFisico::with('titulacion.graduado')
            ->where('ubicacion_actual', 'LEON')
            ->get();

        return view('impresion.create', compact('titulos'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'titulos' => ['required', 'array', 'min:1'],
            'titulos.*' => ['exists:titulos_fisicos,id'],
            'observaciones' => ['nullable', 'string'],
        ]);

        $lote = $this->loteSvc->enviar($data['titulos'], $data['observaciones'] ?? null);

        return redirect()->route('impresion.show', $lote)->with('success', "Lote {$lote->numero_lote} enviado a imprenta.");
    }

    public function show(LoteImpresion $lote): View
    {
        $lote->load('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio', 'responsableRecepcion');

        return view('impresion.show', compact('lote'));
    }

    public function registrarRetorno(Request $request, LoteImpresion $lote): RedirectResponse
    {
        $data = $request->validate([
            'observaciones' => ['nullable', 'string'],
        ]);

        $this->loteSvc->registrarRetorno($lote, $data['observaciones'] ?? null);

        return redirect()->route('impresion.show', $lote)->with('success', 'Lote retornado de imprenta correctamente.');
    }
}
