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
        Schema::create('lotes_setec', function (Blueprint $table) {
            $table->id();
            $table->string('numero_lote')->unique();
            $table->timestamp('fecha_envio')->nullable();
            $table->foreignId('responsable_envio_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_retorno')->nullable();
            $table->foreignId('responsable_recepcion_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('estado', ['ENVIADO', 'RETORNADO'])->default('ENVIADO');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lotes_setec');
    }
};
