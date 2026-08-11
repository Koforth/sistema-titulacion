<?php

namespace App\Services;

use App\Models\ProcesoTitulo;
use Illuminate\Support\Carbon;

class ProcesoTituloService
{
    public const SLA_DIAS = 45;

    /**
     * Etapas manejadas por el sistema.
     */
    public const ETAPAS = [
        'solicitado_estudiante' => 'Solicitado por el estudiante',
        'expediente_completo' => 'Expediente completo en titulación',
        'elaboracion_bd' => 'Elaboración de base de datos',
        'elaboracion_titulo' => 'Elaboración del título',
        'doc_certificacion' => 'Elaboración de documento para certificación de título',
        'en_gaceta' => 'En gaceta',
        'titulo_entregado_graduado' => 'Título entregado al graduado',
        'titulo_anulado' => 'Título anulado',
        'titulo_rechazado' => 'Título rechazado',
        'otro' => 'Otro',
        'pendiente' => 'Pendiente',
        'en_revision' => 'En revisión',
        'revisado' => 'Revisado',
        'validado' => 'Validado',
        'entregado_estudiante' => 'Entregado al estudiante',
    ];

    /**
     * Marca una etapa como verdadera y gestiona el SLA.
     */
    public function marcarEtapa(ProcesoTitulo $proceso, string $etapa, bool $valor = true): ProcesoTitulo
    {
        if (! array_key_exists($etapa, self::ETAPAS)) {
            abort(422, "Etapa inválida: {$etapa}");
        }

        $proceso->{$etapa} = $valor;
        $proceso->save();

        $this->gestionarSla($proceso);

        return $proceso->fresh();
    }

    /**
     * El SLA inicia cuando "Solicitado por el estudiante" y
     * "Expediente completo en titulación" son verdaderos.
     */
    public function gestionarSla(ProcesoTitulo $proceso): void
    {
        $debeIniciar = $proceso->solicitado_estudiante && $proceso->expediente_completo;
        $estaFinalizado = $proceso->titulo_entregado_graduado;

        if ($debeIniciar && ! $proceso->slaIniciado()) {
            $proceso->fecha_inicio_sla = now();
            $proceso->fecha_limite_sla = now()->copy()->addDays(self::SLA_DIAS);
            $proceso->save();
        }

        if ($estaFinalizado) {
            // El proceso termina; se conservan las fechas para trazabilidad.
            $proceso->save();
        }
    }

    /**
     * Genera la fecha límite de SLA para un registro nuevo.
     */
    public static function fechaLimite(Carbon $inicio): Carbon
    {
        return $inicio->copy()->addDays(self::SLA_DIAS);
    }
}
