<?php

namespace App\Services;

use App\Models\HistorialTitulo;
use App\Models\TituloFisico;
use Illuminate\Support\Facades\Auth;

class HistorialTituloService
{
    public function registrar(
        TituloFisico $titulo,
        string $tipoEvento,
        ?string $descripcion = null
    ): HistorialTitulo {
        return HistorialTitulo::create([
            'titulo_fisico_id' => $titulo->id,
            'tipo_evento' => $tipoEvento,
            'fecha' => now(),
            'usuario_id' => Auth::id(),
            'descripcion' => $descripcion,
        ]);
    }
}
