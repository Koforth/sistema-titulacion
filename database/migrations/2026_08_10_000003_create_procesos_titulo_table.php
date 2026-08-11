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
        Schema::create('procesos_titulo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('titulacion_id')->constrained('titulaciones')->cascadeOnDelete();

            // Etapas del workflow (booleanas)
            $table->boolean('solicitado_estudiante')->default(false);
            $table->boolean('expediente_completo')->default(false);
            $table->boolean('elaboracion_bd')->default(false);
            $table->boolean('elaboracion_titulo')->default(false);
            $table->boolean('doc_certificacion')->default(false);
            $table->boolean('en_gaceta')->default(false);
            $table->boolean('titulo_entregado_graduado')->default(false);
            $table->boolean('titulo_anulado')->default(false);
            $table->boolean('titulo_rechazado')->default(false);
            $table->boolean('otro')->default(false);
            $table->boolean('pendiente')->default(false);
            $table->boolean('en_revision')->default(false);
            $table->boolean('revisado')->default(false);
            $table->boolean('validado')->default(false);
            $table->boolean('entregado_estudiante')->default(false);

            // SLA de 45 días
            $table->timestamp('fecha_inicio_sla')->nullable();
            $table->timestamp('fecha_limite_sla')->nullable();

            $table->string('otro_descripcion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procesos_titulo');
    }
};
