<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ISO 27001 A.5.15 / A.8.2: control de acceso basado en roles.
            $table->string('role', 20)->default('consulta')->after('password');
            $table->boolean('activo')->default(true)->after('role');
        });

        DB::table('users')->where('email', 'admin@sigtu.edu.ni')->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'activo']);
        });
    }
};
