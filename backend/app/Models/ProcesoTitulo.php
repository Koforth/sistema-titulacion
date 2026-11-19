<?php

namespace App\Models;

use Database\Factories\ProcesoTituloFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'titulacion_id',
    'solicitado_estudiante',
    'expediente_completo',
    'elaboracion_bd',
    'elaboracion_titulo',
    'doc_certificacion',
    'en_gaceta',
    'titulo_entregado_graduado',
    'titulo_anulado',
    'titulo_rechazado',
    'otro',
    'pendiente',
    'en_revision',
    'revisado',
    'validado',
    'entregado_estudiante',
    'fecha_inicio_sla',
    'fecha_limite_sla',
    'otro_descripcion',
])]
class ProcesoTitulo extends Model
{
    /** @use HasFactory<ProcesoTituloFactory> */
    use HasFactory;

    protected $table = 'procesos_titulo';

    protected function casts(): array
    {
        return [
            'solicitado_estudiante' => 'boolean',
            'expediente_completo' => 'boolean',
            'elaboracion_bd' => 'boolean',
            'elaboracion_titulo' => 'boolean',
            'doc_certificacion' => 'boolean',
            'en_gaceta' => 'boolean',
            'titulo_entregado_graduado' => 'boolean',
            'titulo_anulado' => 'boolean',
            'titulo_rechazado' => 'boolean',
            'otro' => 'boolean',
            'pendiente' => 'boolean',
            'en_revision' => 'boolean',
            'revisado' => 'boolean',
            'validado' => 'boolean',
            'entregado_estudiante' => 'boolean',
            'fecha_inicio_sla' => 'datetime',
            'fecha_limite_sla' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Titulacion, $this>
     */
    public function titulacion(): BelongsTo
    {
        return $this->belongsTo(Titulacion::class);
    }

    /**
     * ¿El SLA ya está corriendo?
     */
    public function slaIniciado(): bool
    {
        return $this->fecha_inicio_sla !== null;
    }

    /**
     * ¿El proceso ya terminó?
     */
    public function finalizado(): bool
    {
        return (bool) $this->titulo_entregado_graduado;
    }

    /**
     * ¿Está vencido el SLA?
     */
    public function slaVencido(): bool
    {
        if (! $this->slaIniciado() || $this->finalizado()) {
            return false;
        }

        return now()->gt($this->fecha_limite_sla);
    }

    public function diasRestantes(): int
    {
        if (! $this->slaIniciado() || $this->finalizado()) {
            return 0;
        }

        return (int) now()->startOfDay()->diffInDays($this->fecha_limite_sla->startOfDay(), false);
    }
}
