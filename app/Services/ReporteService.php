<?php

namespace App\Services;

use App\Models\ProcesoTitulo;
use App\Models\TituloFisico;

class ReporteService
{
    /**
     * Títulos según ubicación (fuente autoritativa).
     */
    public function porUbicacion(string $ubicacion)
    {
        return TituloFisico::where('ubicacion_actual', $ubicacion)
            ->with('titulacion.graduado')
            ->get();
    }

    /**
     * Procesos con SLA vencido (más de 45 días) y no finalizados.
     */
    public function alertasSlaVencido()
    {
        return ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')
            ->where('titulo_entregado_graduado', false)
            ->whereNotNull('fecha_limite_sla')
            ->where('fecha_limite_sla', '<', now())
            ->get()
            ->filter(fn (ProcesoTitulo $p) => $p->slaVencido())
            ->values();
    }

    /**
     * Títulos en cualquier ubicación distinta a ENTREGADO (en curso).
     */
    public function enProceso()
    {
        return TituloFisico::where('ubicacion_actual', '!=', 'ENTREGADO')
            ->with('titulacion.graduado')
            ->get();
    }
}
