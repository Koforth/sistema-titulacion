<?php

namespace App\Http\Controllers;

use App\Models\Graduado;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class GraduadoController extends Controller
{
    public function index(Request $request): View
    {
        $graduados = Graduado::query()
            ->withCount('titulaciones')
            ->when($request->q, function ($query, $q) {
                $query->where('nombre_completo', 'like', "%{$q}%")
                    ->orWhere('carnet', 'like', "%{$q}%")
                    ->orWhere('cedula', 'like', "%{$q}%");
            })
            ->orderBy('nombre_completo')
            ->paginate(15);

        return view('graduados.index', compact('graduados'));
    }

    public function create(): View
    {
        return view('graduados.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'carnet' => ['nullable', 'string', 'max:191'],
            'cedula' => ['nullable', 'string', 'max:191'],
            'nombre_completo' => ['required', 'string', 'max:191'],
            'email' => ['nullable', 'email', 'max:191'],
            'telefono' => ['nullable', 'string', 'max:191'],
        ]);

        Graduado::create($data);

        return redirect()->route('graduados.index')->with('success', 'Graduado creado correctamente.');
    }

    public function show(Graduado $graduado): View
    {
        $graduado->load('titulaciones');

        return view('graduados.show', compact('graduado'));
    }

    public function edit(Graduado $graduado): View
    {
        return view('graduados.edit', compact('graduado'));
    }

    public function update(Request $request, Graduado $graduado): RedirectResponse
    {
        $data = $request->validate([
            'carnet' => ['nullable', 'string', 'max:191'],
            'cedula' => ['nullable', 'string', 'max:191'],
            'nombre_completo' => ['required', 'string', 'max:191'],
            'email' => ['nullable', 'email', 'max:191'],
            'telefono' => ['nullable', 'string', 'max:191'],
        ]);

        $graduado->update($data);

        return redirect()->route('graduados.index')->with('success', 'Graduado actualizado correctamente.');
    }

    public function destroy(Graduado $graduado): RedirectResponse
    {
        $graduado->delete();

        return redirect()->route('graduados.index')->with('success', 'Graduado eliminado.');
    }
}
