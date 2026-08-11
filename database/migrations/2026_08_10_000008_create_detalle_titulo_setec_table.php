<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detalle_titulo_setec', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lote_setec_id')->constrained('lotes_setec')->cascadeOnDelete();
            $table->foreignId('titulo_fisico_id')->constrained('titulos_fisicos')->cascadeOnDelete();
            $table->enum('estado', ['PENDIENTE', 'CERTIFICADO', 'OBSERVADO', 'NO_RECIBIDO'])->default('PENDIENTE');
            $table->text('observacion')->nullable();
            $table->timestamp('fecha_certificacion')->nullable();
            $table->timestamps();

            $table->unique(['lote_setec_id', 'titulo_fisico_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_titulo_setec');
    }
};
