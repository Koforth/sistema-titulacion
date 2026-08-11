<?php

namespace App\Services;

use App\Models\LoteImpresion;
use App\Models\LoteImpresionTitulo;
use App\Models\TituloFisico;
use Illuminate\Support\Collection;

class LoteImpresionService extends LoteService
{
    /**
     * Crea un lote de impresión y envía los títulos a la imprenta (Managua).
     *
     * @param  Collection<int, int>|array  $tituloIds
     */
    public function enviar(Collection|array $tituloIds, ?string $observaciones = null): LoteImpresion
    {
        $lote = LoteImpresion::create([
            'numero_lote' => $this->generarNumeroLote('IMP', 'lotes_impresion'),
            'fecha_envio' => now(),
            'responsable_envio_id' => $this->usuarioId(),
            'estado' => 'ENVIADO',
            'observaciones' => $observaciones,
        ]);

        $titulos = TituloFisico::whereIn('id', $tituloIds)->get();

        foreach ($titulos as $titulo) {
            LoteImpresionTitulo::create([
                'lote_impresion_id' => $lote->id,
                'titulo_fisico_id' => $titulo->id,
                'estado' => 'ENVIADO',
            ]);
        }

        $this->moverTitulos($titulos, 'IMPRENTA', 'Enviado a imprenta', 'Lote ' . $lote->numero_lote);

        return $lote->load('detalle');
    }

    /**
     * Registra el retorno del lote desde la imprenta.
     */
    public function registrarRetorno(LoteImpresion $lote, ?string $observaciones = null): LoteImpresion
    {
        if ($lote->estado === 'RETORNADO') {
            abort(422, 'El lote ya fue retornado.');
        }

        $lote->update([
            'fecha_retorno' => now(),
            'responsable_recepcion_id' => $this->usuarioId(),
            'estado' => 'RETORNADO',
            'observaciones' => $observaciones ?: $lote->observaciones,
        ]);

        $titulos = $lote->detalle->map(fn (LoteImpresionTitulo $d) => $d->tituloFisico);

        $this->moverTitulos($titulos, 'LEON', 'Recibido de imprenta', 'Lote ' . $lote->numero_lote);

        return $lote->fresh(['detalle']);
    }
}
