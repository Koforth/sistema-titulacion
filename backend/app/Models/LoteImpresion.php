<?php

namespace App\Models;

use Database\Factories\LoteImpresionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'numero_lote',
    'fecha_envio',
    'responsable_envio_id',
    'fecha_retorno',
    'responsable_recepcion_id',
    'estado',
    'observaciones',
])]
class LoteImpresion extends Model
{
    /** @use HasFactory<LoteImpresionFactory> */
    use HasFactory;

    protected $table = 'lotes_impresion';

    protected function casts(): array
    {
        return [
            'fecha_envio' => 'datetime',
            'fecha_retorno' => 'datetime',
        ];
    }

    /**
     * @return HasMany<LoteImpresionTitulo, $this>
     */
    public function detalle(): HasMany
    {
        return $this->hasMany(LoteImpresionTitulo::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function responsableEnvio(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsable_envio_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function responsableRecepcion(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsable_recepcion_id');
    }
}
