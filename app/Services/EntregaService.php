<?php

namespace App\Services;

use App\Models\TituloFisico;
use Illuminate\Support\Facades\DB;

class EntregaService
{
    public function __construct(
        private TituloFisicoService $tituloFisico,
        private ProcesoTituloService $procesoTitulo,
    ) {
    }

    /**
     * Entrega el título al graduado.
     *
     * Cierra el proceso físico y administrativo.
     */
    public function entregar(
        TituloFisico $titulo,
        ?string $observaciones = null
    ): TituloFisico {
        return DB::transaction(function () use ($titulo, $observaciones) {
            if ($titulo->estaEn('ENTREGADO')) {
                abort(422, 'El título ya fue entregado.');
            }

            $this->tituloFisico->cambiarUbicacion(
                $titulo,
                'ENTREGADO',
                'Título entregado',
                $observaciones
            );

            $proceso = $titulo->titulacion->proceso;

            if ($proceso) {
                $this->procesoTitulo->marcarEtapa($proceso, 'titulo_entregado_graduado');
            }

            return $titulo->fresh(['titulacion.proceso']);
        });
    }
}
