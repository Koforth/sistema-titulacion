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
        Schema::create('titulos_fisicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('titulacion_id')->constrained('titulaciones')->cascadeOnDelete();
            $table->string('numero_titulo')->nullable();
            $table->string('libro')->nullable();
            $table->string('tomo')->nullable();
            $table->string('folio')->nullable();
            $table->uuid('uuid')->unique();
            $table->string('qr')->nullable();
            $table->enum('ubicacion_actual', ['LEON', 'IMPRENTA', 'SETEC', 'ENTREGADO'])->default('LEON');
            $table->string('calidad')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('titulos_fisicos');
    }
};
