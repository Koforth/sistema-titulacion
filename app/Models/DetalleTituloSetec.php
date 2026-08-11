<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'lote_setec_id',
    'titulo_fisico_id',
    'estado',
    'observacion',
    'fecha_certificacion',
])]
class DetalleTituloSetec extends Model
{
    /** @use HasFactory<\Database\Factories\DetalleTituloSetecFactory> */
    use HasFactory;

    protected $table = 'detalle_titulo_setec';

    protected function casts(): array
    {
        return [
            'fecha_certificacion' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<LoteSetec, $this>
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(LoteSetec::class, 'lote_setec_id');
    }

    /**
     * @return BelongsTo<TituloFisico, $this>
     */
    public function tituloFisico(): BelongsTo
    {
        return $this->belongsTo(TituloFisico::class);
    }
}
