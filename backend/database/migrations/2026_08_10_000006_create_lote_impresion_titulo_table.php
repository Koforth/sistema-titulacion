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
        Schema::create('lote_impresion_titulo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lote_impresion_id')->constrained('lotes_impresion')->cascadeOnDelete();
            $table->foreignId('titulo_fisico_id')->constrained('titulos_fisicos')->cascadeOnDelete();
            $table->string('estado')->nullable();
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->unique(['lote_impresion_id', 'titulo_fisico_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lote_impresion_titulo');
    }
};
