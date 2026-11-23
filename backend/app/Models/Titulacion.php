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
    'titulo_obtenido',
    'anio_inicio_estudio',
    'anio_fin_estudio',
    'anio_graduacion',
    'registrado_no',
    'folio',
    'tomo_registro',
    'fecha_emision_titulo',
    'sede',
    'duracion_anios',
    'numero_asignaturas',
    'programa_especial',
    'forma_culminacion',
    'numero_gaceta',
    'pagina_gaceta',
    'fecha_gaceta',
    'acceso_internet',
    'tipo_acceso_internet',
    'empresa_acceso_internet',
    'fecha_registro_setec',
    'registrador',
    'fecha_titulacion',
    'modalidad',
    'estado',
    'evidencias',
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
            'fecha_emision_titulo' => 'date',
            'fecha_gaceta' => 'date',
            'fecha_registro_setec' => 'date',
            'acceso_internet' => 'boolean',
            'evidencias' => 'array',
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
