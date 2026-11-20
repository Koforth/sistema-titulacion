<?php

namespace App\Services;

use App\Models\TituloFisico;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

abstract class LoteService
{
    public function __construct(
        protected TituloFisicoService $tituloFisico,
        protected HistorialTituloService $historial,
    ) {}

    protected function generarNumeroLote(string $prefijo, string $columnaTabla): string
    {
        do {
            $numero = sprintf('%s-%s-%03d', $prefijo, now()->year, random_int(1, 999));
        } while (\DB::table($columnaTabla)->where('numero_lote', $numero)->exists());

        return $numero;
    }

    /**
     * Cambia la ubicación de varios títulos a la vez.
     *
     * @param  Collection<int, TituloFisico>  $titulos
     */
    protected function moverTitulos(
        Collection $titulos,
        string $ubicacion,
        string $tipoEvento,
        string $descripcionBase
    ): void {
        foreach ($titulos as $titulo) {
            $this->tituloFisico->cambiarUbicacion(
                $titulo,
                $ubicacion,
                $tipoEvento,
                $descripcionBase.' '.$titulo->numero_titulo
            );
        }
    }

    protected function usuarioId(): ?int
    {
        return Auth::id();
    }
}
