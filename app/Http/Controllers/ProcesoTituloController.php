<?php

namespace App\Http\Controllers;

use App\Models\ProcesoTitulo;
use App\Models\Titulacion;
use App\Services\ProcesoTituloService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProcesoTituloController extends Controller
{
    public function __construct(
        private ProcesoTituloService $procesoSvc,
    ) {
    }

    public function index(Request $request): View
    {
        $procesos = ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')
            ->when($request->q, function ($query, $q) {
                $query->whereHas('titulacion.graduado', function ($query) use ($q) {
                    $query->where('nombre_completo', 'like', "%{$q}%");
                });
            })
            ->latest()
            ->paginate(15);

        return view('procesos.index', compact('procesos'));
    }

    public function show(ProcesoTitulo $proceso): View
    {
        $proceso->load('titulacion.graduado', 'titulacion.tituloFisico');

        return view('procesos.show', [
            'proceso' => $proceso,
            'etapas' => ProcesoTituloService::ETAPAS,
        ]);
    }

    /**
     * Crea un proceso de titulación a partir de una titulación.
     */
    public function crearParaTitulacion(Titulacion $titulacion): RedirectResponse
    {
        if ($titulacion->proceso) {
            return redirect()
                ->route('procesos-titulo.show', $titulacion->proceso)
                ->with('info', 'La titulación ya tiene un proceso.');
        }

        $proceso = ProcesoTitulo::create([
            'titulacion_id' => $titulacion->id,
            'pendiente' => true,
        ]);

        return redirect()
            ->route('procesos-titulo.show', $proceso)
            ->with('success', 'Proceso de titulación creado.');
    }

    /**
     * Marca/desmarca una etapa del proceso.
     */
    public function marcarEtapa(Request $request, ProcesoTitulo $proceso): RedirectResponse
    {
        $data = $request->validate([
            'etapa' => ['required', 'string'],
            'valor' => ['required', 'boolean'],
        ]);

        if ($proceso->finalizado()) {
            return back()->with('error', 'El proceso ya está finalizado.');
        }

        $this->procesoSvc->marcarEtapa($proceso, $data['etapa'], $data['valor']);

        return back()->with('success', 'Etapa actualizada correctamente.');
    }
}
