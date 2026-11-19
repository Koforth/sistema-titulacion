<?php

namespace App\Http\Controllers;

use App\Models\Titulacion;
use App\Models\TituloFisico;
use App\Services\HistorialTituloService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class TituloFisicoController extends Controller
{
    public function index(Request $request): View
    {
        $titulos = TituloFisico::with('titulacion.graduado')
            ->when($request->ubicacion, function ($query, $ubicacion) {
                $query->where('ubicacion_actual', $ubicacion);
            })
            ->when($request->q, function ($query, $q) {
                $query->where(function ($query) use ($q) {
                    $query->where('numero_titulo', 'like', "%{$q}%")
                        ->orWhereHas('titulacion.graduado', function ($query) use ($q) {
                            $query->where('nombre_completo', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(15);

        return view('titulos-fisicos.index', compact('titulos'));
    }

    public function create(): View
    {
        $titulaciones = Titulacion::with('graduado')
            ->whereDoesntHave('tituloFisico')
            ->orderBy('id')
            ->get();

        return view('titulos-fisicos.create', compact('titulaciones'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'titulacion_id' => ['required', 'exists:titulaciones,id'],
            'numero_titulo' => ['required', 'string', 'max:191'],
            'libro' => ['nullable', 'string', 'max:191'],
            'tomo' => ['nullable', 'string', 'max:191'],
            'folio' => ['nullable', 'string', 'max:191'],
            'calidad' => ['nullable', 'string', 'max:191'],
            'observaciones' => ['nullable', 'string'],
        ]);

        $data['uuid'] = (string) Str::uuid();
        $data['ubicacion_actual'] = 'LEON';

        $titulo = TituloFisico::create($data);

        $historial = app(HistorialTituloService::class);
        $historial->registrar($titulo, 'Título creado', 'Se registró el documento físico en León.');

        return redirect()->route('titulos-fisicos.index')->with('success', 'Título físico creado correctamente.');
    }

    public function show(TituloFisico $titulo): View
    {
        $titulo->load('titulacion.graduado', 'titulacion.proceso', 'historial.usuario');

        return view('titulos-fisicos.show', compact('titulo'));
    }

    public function edit(TituloFisico $titulo): View
    {
        $titulo->load('titulacion.graduado');

        return view('titulos-fisicos.edit', compact('titulo'));
    }

    /**
     * Edición de metadatos documentales permitidos.
     * La ubicación NO es editable manualmente.
     */
    public function update(Request $request, TituloFisico $titulo): RedirectResponse
    {
        $data = $request->validate([
            'numero_titulo' => ['required', 'string', 'max:191'],
            'libro' => ['nullable', 'string', 'max:191'],
            'tomo' => ['nullable', 'string', 'max:191'],
            'folio' => ['nullable', 'string', 'max:191'],
            'calidad' => ['nullable', 'string', 'max:191'],
            'observaciones' => ['nullable', 'string'],
        ]);

        $titulo->update($data);

        return redirect()->route('titulos-fisicos.show', $titulo)->with('success', 'Metadatos actualizados.');
    }

    /**
     * Hoja de vida del título.
     */
    public function historial(TituloFisico $titulo): View
    {
        $titulo->load('titulacion.graduado', 'historial.usuario');

        return view('titulos-fisicos.historial', compact('titulo'));
    }

    /**
     * Regenera el QR del título.
     */
    public function regenerarQr(TituloFisico $titulo): RedirectResponse
    {
        $titulo->update(['qr' => null]);

        $historial = app(HistorialTituloService::class);
        $historial->registrar($titulo, 'QR regenerado', 'Se regeneró el código QR del título.');

        return back()->with('success', 'QR regenerado correctamente.');
    }
}
