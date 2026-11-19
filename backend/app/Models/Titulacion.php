<?php

namespace App\Models;

use Database\Factories\TitulacionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'graduado_id',
    'carrera',
    'fecha_titulacion',
    'modalidad',
    'estado',
])]
class Titulacion extends Model
{
    /** @use HasFactory<TitulacionFactory> */
    use HasFactory;

    protected $table = 'titulaciones';

    protected function casts(): array
    {
        return [
            'fecha_titulacion' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Graduado, $this>
     */
    public function graduado(): BelongsTo
    {
        return $this->belongsTo(Graduado::class);
    }

    /**
     * @return HasOne<ProcesoTitulo, $this>
     */
    public function proceso(): HasOne
    {
        return $this->hasOne(ProcesoTitulo::class);
    }

    /**
     * @return HasOne<TituloFisico, $this>
     */
    public function tituloFisico(): HasOne
    {
        return $this->hasOne(TituloFisico::class);
    }

    /**
     * @return HasMany<TituloFisico, $this>
     */
    public function titulosFisicos(): HasMany
    {
        return $this->hasMany(TituloFisico::class);
    }
}
