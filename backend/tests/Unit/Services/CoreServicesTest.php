<?php

namespace Tests\Unit\Services;

use App\Models\Graduado;
use App\Models\ProcesoTitulo;
use App\Models\Titulacion;
use App\Models\TituloFisico;
use App\Services\ReporteService;
use App\Services\EntregaService;
use App\Services\TituloFisicoService;
use App\Services\ProcesoTituloService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoreServicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_reporte_por_ubicacion_filtra_correctamente(): void
    {
        $graduado = Graduado::create(['nombre_completo' => 'Carlos López']);
        $titulacion = Titulacion::create([
            'graduado_id' => $graduado->id,
            'carrera' => 'Ingeniería en Sistemas',
            'estado' => 'pendiente',
        ]);

        TituloFisico::create([
            'titulacion_id' => $titulacion->id,
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'numero_titulo' => 'TIT-LEON-01',
            'ubicacion_actual' => 'LEON',
        ]);

        $servicio = app(ReporteService::class);
        $enLeon = $servicio->porUbicacion('LEON');
        $enImprenta = $servicio->porUbicacion('IMPRENTA');

        $this->assertCount(1, $enLeon);
        $this->assertEquals('TIT-LEON-01', $enLeon->first()->numero_titulo);
        $this->assertCount(0, $enImprenta);
    }

    public function test_entrega_service_cambia_ubicacion_a_entregado(): void
    {
        $graduado = Graduado::create(['nombre_completo' => 'Ana Martínez']);
        $titulacion = Titulacion::create([
            'graduado_id' => $graduado->id,
            'carrera' => 'Derecho',
            'estado' => 'pendiente',
        ]);
        $proceso = ProcesoTitulo::create([
            'titulacion_id' => $titulacion->id,
            'pendiente' => true,
        ]);
        $titulo = TituloFisico::create([
            'titulacion_id' => $titulacion->id,
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'numero_titulo' => 'TIT-ENTREGA-01',
            'ubicacion_actual' => 'LEON',
        ]);

        $entregaService = app(EntregaService::class);
        $tituloEntregado = $entregaService->entregar($titulo, 'Entregado en ventanilla');

        $this->assertEquals('ENTREGADO', $tituloEntregado->ubicacion_actual);
        $this->assertTrue((bool)$proceso->fresh()->titulo_entregado_graduado);
    }
}
