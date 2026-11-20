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
        Schema::create('titulaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('graduado_id')->constrained('graduados')->cascadeOnDelete();
            $table->string('carrera');
            $table->date('fecha_titulacion')->nullable();
            $table->string('modalidad')->nullable();
            $table->string('estado')->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('titulaciones');
    }
};
