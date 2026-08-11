<?php

namespace App\Http\Controllers;

use App\Models\Graduado;
use App\Models\Titulacion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TitulacionController extends Controller
{
    public function index(Request $request): View
    {
        $titulaciones = Titulacion::with('graduado', 'proceso', 'tituloFisico')
            ->when($request->q, function ($query, $q) {
                $query->whereHas('graduado', function ($query) use ($q) {
                    $query->where('nombre_completo', 'like', "%{$q}%")
                        ->orWhere('carnet', 'like', "%{$q}%");
                });
            })
            ->latest()
            ->paginate(15);

        return view('titulaciones.index', compact('titulaciones'));
    }

    public function create(): View
    {
        $graduados = Graduado::orderBy('nombre_completo')->get();

        return view('titulaciones.create', compact('graduados'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'graduado_id' => ['required', 'exists:graduados,id'],
            'carrera' => ['required', 'string', 'max:191'],
            'fecha_titulacion' => ['nullable', 'date'],
            'modalidad' => ['nullable', 'string', 'max:191'],
        ]);

        $data['estado'] = 'pendiente';

        Titulacion::create($data);

        return redirect()->route('titulaciones.index')->with('success', 'Titulación creada correctamente.');
    }

    public function show(Titulacion $titulacion): View
    {
        $titulacion->load('graduado', 'proceso', 'tituloFisico');

        return view('titulaciones.show', compact('titulacion'));
    }

    public function edit(Titulacion $titulacion): View
    {
        $graduados = Graduado::orderBy('nombre_completo')->get();

        return view('titulaciones.edit', compact('titulacion', 'graduados'));
    }

    public function update(Request $request, Titulacion $titulacion): RedirectResponse
    {
        $data = $request->validate([
            'graduado_id' => ['required', 'exists:graduados,id'],
            'carrera' => ['required', 'string', 'max:191'],
            'fecha_titulacion' => ['nullable', 'date'],
            'modalidad' => ['nullable', 'string', 'max:191'],
        ]);

        $titulacion->update($data);

        return redirect()->route('titulaciones.index')->with('success', 'Titulación actualizada correctamente.');
    }

    public function destroy(Titulacion $titulacion): RedirectResponse
    {
        $titulacion->delete();

        return redirect()->route('titulaciones.index')->with('success', 'Titulación eliminada.');
    }
}
