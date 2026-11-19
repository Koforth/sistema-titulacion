<?php

namespace App\Http\Controllers;

use App\Models\TituloFisico;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ConsultaPublicaController extends Controller
{
    /**
     * Home pública del sistema.
     */
    public function home(): View
    {
        $estadisticas = [
            'titulos_emitidos' => TituloFisico::where('ubicacion_actual', 'ENTREGADO')->count(),
            'total_registrados' => TituloFisico::count(),
        ];

        return view('consulta-publica.home', compact('estadisticas'));
    }

    /**
     * Búsqueda pública por número de título o nombre.
     */
    public function buscar(Request $request): View
    {
        $titulos = collect();

        if ($request->q) {
            $titulos = TituloFisico::with('titulacion.graduado')
                ->where('ubicacion_actual', 'ENTREGADO')
                ->where(function ($query) use ($request) {
                    $query->where('numero_titulo', 'like', "%{$request->q}%")
                        ->orWhereHas('titulacion.graduado', function ($query) use ($request) {
                            $query->where('nombre_completo', 'like', "%{$request->q}%");
                        });
                })
                ->get();
        }

        return view('consulta-publica.buscar', compact('titulos'));
    }

    /**
     * Verificación pública por UUID (URL del QR).
     */
    public function verificar(string $uuid): View
    {
        $titulo = TituloFisico::with('titulacion.graduado')
            ->where('uuid', $uuid)
            ->firstOrFail();

        return view('consulta-publica.verificar', compact('titulo'));
    }
}
