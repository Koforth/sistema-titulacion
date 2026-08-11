<?php

namespace App\Services;

use App\Models\DetalleTituloSetec;
use App\Models\LoteSetec;
use App\Models\TituloFisico;
use Illuminate\Support\Collection;

class LoteSetecService extends LoteService
{
    /**
     * Crea un lote SETEC y envía los títulos a certificación.
     *
     * @param  Collection<int, int>|array  $tituloIds
     */
    public function enviar(Collection|array $tituloIds, ?string $observaciones = null): LoteSetec
    {
        $lote = LoteSetec::create([
            'numero_lote' => $this->generarNumeroLote('SETEC', 'lotes_setec'),
            'fecha_envio' => now(),
            'responsable_envio_id' => $this->usuarioId(),
            'estado' => 'ENVIADO',
            'observaciones' => $observaciones,
        ]);

        $titulos = TituloFisico::whereIn('id', $tituloIds)->get();

        foreach ($titulos as $titulo) {
            DetalleTituloSetec::create([
                'lote_setec_id' => $lote->id,
                'titulo_fisico_id' => $titulo->id,
                'estado' => 'PENDIENTE',
            ]);
        }

        $this->moverTitulos($titulos, 'SETEC', 'Enviado a SETEC', 'Lote ' . $lote->numero_lote);

        return $lote->load('detalle');
    }

    /**
     * Registra el resultado de certificación de un título del lote.
     */
    public function registrarCertificacion(
        DetalleTituloSetec $detalle,
        string $estado,
        ?string $observacion = null
    ): DetalleTituloSetec {
        $permitidos = ['CERTIFICADO', 'OBSERVADO', 'NO_RECIBIDO'];

        if (! in_array($estado, $permitidos, true)) {
            abort(422, "Estado de certificación inválido: {$estado}");
        }

        $detalle->update([
            'estado' => $estado,
            'observacion' => $observacion,
            'fecha_certificacion' => now(),
        ]);

        $tipoEvento = match ($estado) {
            'CERTIFICADO' => 'Certificado',
            'OBSERVADO' => 'Observado',
            'NO_RECIBIDO' => 'No recibido',
        };

        $this->historial->registrar(
            $detalle->tituloFisico,
            $tipoEvento,
            'Lote ' . $detalle->lote->numero_lote . ($observacion ? ' — ' . $observacion : '')
        );

        return $detalle->fresh();
    }

    /**
     * Registra el retorno del lote desde SETEC.
     */
    public function registrarRetorno(LoteSetec $lote, ?string $observaciones = null): LoteSetec
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

        $titulos = $lote->detalle->map(fn (DetalleTituloSetec $d) => $d->tituloFisico);

        $this->moverTitulos($titulos, 'LEON', 'Recibido de SETEC', 'Lote ' . $lote->numero_lote);

        return $lote->fresh(['detalle']);
    }
}
