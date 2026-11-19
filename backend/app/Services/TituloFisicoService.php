<?php

namespace App\Services;

use App\Models\TituloFisico;
use RuntimeException;

class TituloFisicoService
{
    public function __construct(
        private HistorialTituloService $historial,
    ) {}

    /**
     * Cambia la ubicación de un título físico.
     *
     * La ubicación es de solo lectura para el usuario; SOLO debe
     * cambiar mediante eventos (impresión, SETEC, entrega).
     */
    public function cambiarUbicacion(
        TituloFisico $titulo,
        string $nuevaUbicacion,
        string $tipoEvento,
        ?string $descripcion = null
    ): TituloFisico {
        $ubicacionesPermitidas = ['LEON', 'IMPRENTA', 'SETEC', 'ENTREGADO'];

        if (! in_array($nuevaUbicacion, $ubicacionesPermitidas, true)) {
            throw new RuntimeException("Ubicación inválida: {$nuevaUbicacion}");
        }

        if ($titulo->ubicacion_actual === $nuevaUbicacion) {
            return $titulo;
        }

        $titulo->update(['ubicacion_actual' => $nuevaUbicacion]);

        $this->historial->registrar($titulo, $tipoEvento, $descripcion);

        return $titulo->fresh();
    }
}
