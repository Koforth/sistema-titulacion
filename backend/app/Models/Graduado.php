<?php

namespace App\Models;

use Database\Factories\GraduadoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'carnet',
    'cedula',
    'tipo_identidad',
    'nombres',
    'apellidos',
    'nombre_completo',
    'sexo',
    'pais',
    'estado_civil',
    'etnia',
    'departamento_origen',
    'municipio_origen',
    'departamento_residencia',
    'municipio_residencia',
    'direccion_residencia',
    'email',
    'telefono',
    'anio_bachillerato',
    'tipo_bachillerato',
    'turno_bachillerato',
    'modalidad_bachillerato',
])]
class Graduado extends Model
{
    /** @use HasFactory<GraduadoFactory> */
    use HasFactory;

    protected $table = 'graduados';

    /**
     * @return HasMany<Titulacion, $this>
     */
    public function titulaciones(): HasMany
    {
        return $this->hasMany(Titulacion::class);
    }
}
