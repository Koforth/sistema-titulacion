<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'titulo_fisico_id',
    'tipo_evento',
    'fecha',
    'usuario_id',
    'descripcion',
])]
class HistorialTitulo extends Model
{
    /** @use HasFactory<\Database\Factories\HistorialTituloFactory> */
    use HasFactory;

    protected $table = 'historial_titulos';

    protected function casts(): array
    {
        return [
            'fecha' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<TituloFisico, $this>
     */
    public function tituloFisico(): BelongsTo
    {
        return $this->belongsTo(TituloFisico::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
