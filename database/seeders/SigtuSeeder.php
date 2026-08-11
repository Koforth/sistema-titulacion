<?php

namespace Database\Seeders;

use App\Models\DetalleTituloSetec;
use App\Models\Graduado;
use App\Models\HistorialTitulo;
use App\Models\LoteImpresion;
use App\Models\LoteImpresionTitulo;
use App\Models\LoteSetec;
use App\Models\ProcesoTitulo;
use App\Models\Titulacion;
use App\Models\TituloFisico;
use App\Models\User;
use App\Services\ProcesoTituloService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SigtuSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \DB::table('historial_titulos')->truncate();
        \DB::table('detalle_titulo_setec')->truncate();
        \DB::table('lote_impresion_titulo')->truncate();
        \DB::table('lotes_setec')->truncate();
        \DB::table('lotes_impresion')->truncate();
        \DB::table('titulos_fisicos')->truncate();
        \DB::table('procesos_titulo')->truncate();
        \DB::table('titulaciones')->truncate();
        \DB::table('graduados')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $user = User::where('email', 'admin@sigtu.edu.ni')->first()
            ?? User::factory()->create([
                'name' => 'Administrador SIGTU',
                'email' => 'admin@sigtu.edu.ni',
            ]);

        $procesoSvc = app(ProcesoTituloService::class);

        // ---- 1. Titulación en elaboración (León) ----
        $g1 = Graduado::factory()->create(['nombre_completo' => 'María José Blandón']);
        $t1 = Titulacion::factory()->create(['graduado_id' => $g1->id, 'carrera' => 'Ingeniería en Sistemas']);
        $p1 = ProcesoTitulo::factory()->create([
            'titulacion_id' => $t1->id,
            'solicitado_estudiante' => true,
            'expediente_completo' => true,
            'elaboracion_bd' => true,
            'elaboracion_titulo' => true,
            'pendiente' => false,
        ]);
        $procesoSvc->gestionarSla($p1);
        $tf1 = $this->crearTituloFisico($t1, 'UNCP-2026-0001', 'LEON');
        $this->historial($tf1, $user, 'Título creado', 'Se registró el documento físico en León.');

        // ---- 2. Titulación en imprenta (Managua) ----
        $g2 = Graduado::factory()->create(['nombre_completo' => 'Carlos Alberto Ruiz']);
        $t2 = Titulacion::factory()->create(['graduado_id' => $g2->id, 'carrera' => 'Medicina']);
        $p2 = ProcesoTitulo::factory()->create([
            'titulacion_id' => $t2->id,
            'solicitado_estudiante' => true,
            'expediente_completo' => true,
            'elaboracion_bd' => true,
            'elaboracion_titulo' => true,
            'doc_certificacion' => true,
            'pendiente' => false,
        ]);
        $procesoSvc->gestionarSla($p2);
        $tf2 = $this->crearTituloFisico($t2, 'UNCP-2026-0002', 'IMPRENTA');
        $this->historial($tf2, $user, 'Título creado', 'Se registró el documento físico en León.');
        $this->historial($tf2, $user, 'Enviado a imprenta', 'Lote IMP-2026-001.');

        // Lote de impresión enviado
        $loteImp = LoteImpresion::factory()->create([
            'numero_lote' => 'IMP-2026-001',
            'fecha_envio' => now()->subDays(5),
            'responsable_envio_id' => $user->id,
        ]);
        LoteImpresionTitulo::factory()->create([
            'lote_impresion_id' => $loteImp->id,
            'titulo_fisico_id' => $tf2->id,
            'estado' => 'ENVIADO',
        ]);

        // ---- 3. Titulación en SETEC ----
        $g3 = Graduado::factory()->create(['nombre_completo' => 'Luis Fernando Martínez']);
        $t3 = Titulacion::factory()->create(['graduado_id' => $g3->id, 'carrera' => 'Derecho']);
        $p3 = ProcesoTitulo::factory()->create([
            'titulacion_id' => $t3->id,
            'solicitado_estudiante' => true,
            'expediente_completo' => true,
            'elaboracion_bd' => true,
            'elaboracion_titulo' => true,
            'doc_certificacion' => true,
            'en_gaceta' => true,
            'pendiente' => false,
        ]);
        $procesoSvc->gestionarSla($p3);
        $tf3 = $this->crearTituloFisico($t3, 'UNCP-2026-0003', 'SETEC');
        $this->historial($tf3, $user, 'Título creado', 'Se registró el documento físico en León.');
        $this->historial($tf3, $user, 'Enviado a imprenta', 'Lote IMP-2026-001.');
        $this->historial($tf3, $user, 'Recibido de imprenta', 'Lote IMP-2026-001.');
        $this->historial($tf3, $user, 'Enviado a SETEC', 'Lote SETEC-2026-001.');

        $loteSetec = LoteSetec::factory()->create([
            'numero_lote' => 'SETEC-2026-001',
            'fecha_envio' => now()->subDays(2),
            'responsable_envio_id' => $user->id,
        ]);
        DetalleTituloSetec::factory()->create([
            'lote_setec_id' => $loteSetec->id,
            'titulo_fisico_id' => $tf3->id,
            'estado' => 'PENDIENTE',
        ]);

        // ---- 4. Titulación entregada (flujo completo) ----
        $g4 = Graduado::factory()->create(['nombre_completo' => 'Ana Lucía Pérez']);
        $t4 = Titulacion::factory()->create(['graduado_id' => $g4->id, 'carrera' => 'Administración de Empresas']);
        $p4 = ProcesoTitulo::factory()->create([
            'titulacion_id' => $t4->id,
            'solicitado_estudiante' => true,
            'expediente_completo' => true,
            'elaboracion_bd' => true,
            'elaboracion_titulo' => true,
            'doc_certificacion' => true,
            'en_gaceta' => true,
            'titulo_entregado_graduado' => true,
            'entregado_estudiante' => true,
            'pendiente' => false,
            'fecha_inicio_sla' => now()->subDays(60),
            'fecha_limite_sla' => now()->subDays(15),
        ]);
        $tf4 = $this->crearTituloFisico($t4, 'UNCP-2026-0004', 'ENTREGADO');
        $this->historial($tf4, $user, 'Título creado', 'Se registró el documento físico en León.');
        $this->historial($tf4, $user, 'Enviado a imprenta', 'Lote IMP-2026-001.');
        $this->historial($tf4, $user, 'Recibido de imprenta', 'Lote IMP-2026-001.');
        $this->historial($tf4, $user, 'Enviado a SETEC', 'Lote SETEC-2026-001.');
        $this->historial($tf4, $user, 'Certificado', 'Lote SETEC-2026-001.');
        $this->historial($tf4, $user, 'Título entregado', 'Entregado al graduado.');

        // ---- 5. Titulación con SLA vencido (alerta > 45 días) ----
        $g5 = Graduado::factory()->create(['nombre_completo' => 'Roberto José Cruz']);
        $t5 = Titulacion::factory()->create(['graduado_id' => $g5->id, 'carrera' => 'Contaduría Pública']);
        $p5 = ProcesoTitulo::factory()->create([
            'titulacion_id' => $t5->id,
            'solicitado_estudiante' => true,
            'expediente_completo' => true,
            'elaboracion_bd' => true,
            'pendiente' => false,
            'fecha_inicio_sla' => now()->subDays(50),
            'fecha_limite_sla' => now()->subDays(5),
        ]);
        $tf5 = $this->crearTituloFisico($t5, 'UNCP-2026-0005', 'LEON');
        $this->historial($tf5, $user, 'Título creado', 'Se registró el documento físico en León.');
    }

    private function crearTituloFisico(Titulacion $titulacion, string $numero, string $ubicacion): TituloFisico
    {
        return TituloFisico::factory()->create([
            'titulacion_id' => $titulacion->id,
            'numero_titulo' => $numero,
            'uuid' => (string) Str::uuid(),
            'ubicacion_actual' => $ubicacion,
        ]);
    }

    private function historial(TituloFisico $tf, User $user, string $evento, ?string $descripcion = null): void
    {
        HistorialTitulo::factory()->create([
            'titulo_fisico_id' => $tf->id,
            'tipo_evento' => $evento,
            'fecha' => now(),
            'usuario_id' => $user->id,
            'descripcion' => $descripcion,
        ]);
    }
}
