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
    'nombre_completo',
    'email',
    'telefono',
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
