<?php

namespace App\Http\Controllers;

use App\Models\DetalleTituloSetec;
use App\Models\LoteSetec;
use App\Models\TituloFisico;
use App\Services\LoteSetecService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class LoteSetecController extends Controller
{
    public function __construct(
        private LoteSetecService $loteSvc,
    ) {
    }

    public function index(): View
    {
        $lotes = LoteSetec::with('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio')
            ->latest()
            ->paginate(15);

        return view('setec.index', compact('lotes'));
    }

    public function create(): View
    {
        $titulos = TituloFisico::with('titulacion.graduado')
            ->where('ubicacion_actual', 'LEON')
            ->get();

        return view('setec.create', compact('titulos'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'titulos' => ['required', 'array', 'min:1'],
            'titulos.*' => ['exists:titulos_fisicos,id'],
            'observaciones' => ['nullable', 'string'],
        ]);

        $lote = $this->loteSvc->enviar($data['titulos'], $data['observaciones'] ?? null);

        return redirect()->route('setec.show', $lote)->with('success', "Lote {$lote->numero_lote} enviado a SETEC.");
    }

    public function show(LoteSetec $lote): View
    {
        $lote->load('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio', 'responsableRecepcion');

        return view('setec.show', compact('lote'));
    }

    public function registrarCertificacion(Request $request, DetalleTituloSetec $detalle): RedirectResponse
    {
        $data = $request->validate([
            'estado' => ['required', 'in:CERTIFICADO,OBSERVADO,NO_RECIBIDO'],
            'observacion' => ['nullable', 'string'],
        ]);

        $this->loteSvc->registrarCertificacion($detalle, $data['estado'], $data['observacion'] ?? null);

        return back()->with('success', 'Certificación registrada correctamente.');
    }

    public function registrarRetorno(Request $request, LoteSetec $lote): RedirectResponse
    {
        $data = $request->validate([
            'observaciones' => ['nullable', 'string'],
        ]);

        $this->loteSvc->registrarRetorno($lote, $data['observaciones'] ?? null);

        return redirect()->route('setec.show', $lote)->with('success', 'Lote retornado de SETEC correctamente.');
    }
}
