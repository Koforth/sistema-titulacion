<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'lote_impresion_id',
    'titulo_fisico_id',
    'estado',
    'observacion',
])]
class LoteImpresionTitulo extends Model
{
    /** @use HasFactory<\Database\Factories\LoteImpresionTituloFactory> */
    use HasFactory;

    protected $table = 'lote_impresion_titulo';

    /**
     * @return BelongsTo<LoteImpresion, $this>
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(LoteImpresion::class, 'lote_impresion_id');
    }

    /**
     * @return BelongsTo<TituloFisico, $this>
     */
    public function tituloFisico(): BelongsTo
    {
        return $this->belongsTo(TituloFisico::class);
    }
}
