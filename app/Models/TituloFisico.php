<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'titulacion_id',
    'numero_titulo',
    'libro',
    'tomo',
    'folio',
    'uuid',
    'qr',
    'ubicacion_actual',
    'calidad',
    'observaciones',
])]
class TituloFisico extends Model
{
    /** @use HasFactory<\Database\Factories\TituloFisicoFactory> */
    use HasFactory;

    protected $table = 'titulos_fisicos';

    /**
     * @return BelongsTo<Titulacion, $this>
     */
    public function titulacion(): BelongsTo
    {
        return $this->belongsTo(Titulacion::class);
    }

    /**
     * @return HasMany<HistorialTitulo, $this>
     */
    public function historial(): HasMany
    {
        return $this->hasMany(HistorialTitulo::class)->orderBy('fecha');
    }

    /**
     * @return HasMany<LoteImpresionTitulo, $this>
     */
    public function lotesImpresion(): HasMany
    {
        return $this->hasMany(LoteImpresionTitulo::class);
    }

    /**
     * @return HasMany<DetalleTituloSetec, $this>
     */
    public function lotesSetec(): HasMany
    {
        return $this->hasMany(DetalleTituloSetec::class);
    }

    public function estaEn(string $ubicacion): bool
    {
        return $this->ubicacion_actual === $ubicacion;
    }
}
