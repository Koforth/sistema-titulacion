<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('titulaciones', function (Blueprint $table) {
            // Campos SETEC: Datos del Título
            $table->string('titulo_obtenido')->nullable()->after('carrera');
            $table->string('anio_inicio_estudio', 10)->nullable()->after('titulo_obtenido');
            $table->string('anio_fin_estudio', 10)->nullable()->after('anio_inicio_estudio');
            $table->string('anio_graduacion', 10)->nullable()->after('anio_fin_estudio');
            $table->string('registrado_no', 100)->nullable()->after('anio_graduacion');
            $table->string('folio', 100)->nullable()->after('registrado_no');
            $table->string('tomo_registro', 100)->nullable()->after('folio');
            $table->date('fecha_emision_titulo')->nullable()->after('tomo_registro');
            $table->string('sede', 100)->nullable()->after('fecha_emision_titulo');
            $table->string('duracion_anios', 20)->nullable()->after('sede');
            $table->string('numero_asignaturas', 20)->nullable()->after('duracion_anios');
            $table->string('programa_especial', 100)->nullable()->after('numero_asignaturas');

            // Datos Adicionales
            $table->string('forma_culminacion', 100)->nullable()->after('programa_especial');
            $table->string('numero_gaceta', 100)->nullable()->after('forma_culminacion');
            $table->string('pagina_gaceta', 100)->nullable()->after('numero_gaceta');
            $table->date('fecha_gaceta')->nullable()->after('pagina_gaceta');
            $table->boolean('acceso_internet')->default(false)->after('fecha_gaceta');
            $table->string('tipo_acceso_internet', 100)->nullable()->after('acceso_internet');
            $table->string('empresa_acceso_internet', 100)->nullable()->after('tipo_acceso_internet');
            $table->date('fecha_registro_setec')->nullable()->after('empresa_acceso_internet');
            $table->string('registrador', 191)->nullable()->after('fecha_registro_setec');
        });
    }

    public function down(): void
    {
        Schema::table('titulaciones', function (Blueprint $table) {
            $table->dropColumn([
                'titulo_obtenido', 'anio_inicio_estudio', 'anio_fin_estudio', 'anio_graduacion',
                'registrado_no', 'folio', 'tomo_registro', 'fecha_emision_titulo', 'sede',
                'duracion_anios', 'numero_asignaturas', 'programa_especial', 'forma_culminacion',
                'numero_gaceta', 'pagina_gaceta', 'fecha_gaceta', 'acceso_internet',
                'tipo_acceso_internet', 'empresa_acceso_internet', 'fecha_registro_setec', 'registrador'
            ]);
        });
    }
};
