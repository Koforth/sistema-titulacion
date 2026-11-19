<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('graduados', function (Blueprint $table) {
            $table->string('tipo_identidad')->nullable()->after('id');
            $table->string('nombres')->nullable()->after('cedula');
            $table->string('apellidos')->nullable()->after('nombres');
            $table->string('sexo', 20)->nullable()->after('apellidos');
            $table->string('pais')->default('Nicaragua')->after('sexo');
            $table->string('estado_civil', 30)->nullable()->after('pais');
            $table->string('etnia', 50)->nullable()->after('estado_civil');
            $table->string('departamento_origen', 100)->nullable()->after('etnia');
            $table->string('municipio_origen', 100)->nullable()->after('departamento_origen');
            $table->string('departamento_residencia', 100)->nullable()->after('municipio_origen');
            $table->string('municipio_residencia', 100)->nullable()->after('departamento_residencia');
            $table->text('direccion_residencia')->nullable()->after('municipio_residencia');
            
            // Datos académicos previos
            $table->string('anio_bachillerato', 10)->nullable()->after('telefono');
            $table->string('tipo_bachillerato', 50)->nullable()->after('anio_bachillerato');
            $table->string('turno_bachillerato', 50)->nullable()->after('tipo_bachillerato');
            $table->string('modalidad_bachillerato', 50)->nullable()->after('turno_bachillerato');
        });
    }

    public function down(): void
    {
        Schema::table('graduados', function (Blueprint $table) {
            $table->dropColumn([
                'tipo_identidad', 'nombres', 'apellidos', 'sexo', 'pais',
                'estado_civil', 'etnia', 'departamento_origen', 'municipio_origen',
                'departamento_residencia', 'municipio_residencia', 'direccion_residencia',
                'anio_bachillerato', 'tipo_bachillerato', 'turno_bachillerato', 'modalidad_bachillerato'
            ]);
        });
    }
};
