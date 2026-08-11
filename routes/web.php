<?php

use App\Http\Controllers\ConsultaPublicaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EntregaController;
use App\Http\Controllers\GraduadoController;
use App\Http\Controllers\LoteImpresionController;
use App\Http\Controllers\LoteSetecController;
use App\Http\Controllers\ProcesoTituloController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\TitulacionController;
use App\Http\Controllers\TituloFisicoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Consulta pública (sin autenticación)
Route::get('/', [ConsultaPublicaController::class, 'home'])->name('home');
Route::get('/consulta-publica', [ConsultaPublicaController::class, 'buscar'])->name('consulta-publica');
Route::get('/verificar/{uuid}', [ConsultaPublicaController::class, 'verificar'])->name('consulta-publica.verificar');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::resource('graduados', GraduadoController::class);
    Route::resource('titulaciones', TitulacionController::class)->parameters([
        'titulaciones' => 'titulacion',
    ]);

    Route::get('/procesos-titulo', [ProcesoTituloController::class, 'index'])->name('procesos-titulo.index');
    Route::get('/procesos-titulo/{proceso}', [ProcesoTituloController::class, 'show'])->name('procesos-titulo.show');
    Route::post('/titulaciones/{titulacion}/crear-proceso', [ProcesoTituloController::class, 'crearParaTitulacion'])->name('procesos-titulo.crear');
    Route::post('/procesos-titulo/{proceso}/marcar-etapa', [ProcesoTituloController::class, 'marcarEtapa'])->name('procesos-titulo.marcar-etapa');

    Route::get('/titulos-fisicos', [TituloFisicoController::class, 'index'])->name('titulos-fisicos.index');
    Route::get('/titulos-fisicos/crear', [TituloFisicoController::class, 'create'])->name('titulos-fisicos.create');
    Route::post('/titulos-fisicos', [TituloFisicoController::class, 'store'])->name('titulos-fisicos.store');
    Route::get('/titulos-fisicos/{titulo}', [TituloFisicoController::class, 'show'])->name('titulos-fisicos.show');
    Route::get('/titulos-fisicos/{titulo}/editar', [TituloFisicoController::class, 'edit'])->name('titulos-fisicos.edit');
    Route::patch('/titulos-fisicos/{titulo}', [TituloFisicoController::class, 'update'])->name('titulos-fisicos.update');
    Route::get('/titulos-fisicos/{titulo}/historial', [TituloFisicoController::class, 'historial'])->name('titulos-fisicos.historial');
    Route::post('/titulos-fisicos/{titulo}/regenerar-qr', [TituloFisicoController::class, 'regenerarQr'])->name('titulos-fisicos.regenerar-qr');

    Route::get('/impresion', [LoteImpresionController::class, 'index'])->name('impresion.index');
    Route::get('/impresion/crear', [LoteImpresionController::class, 'create'])->name('impresion.create');
    Route::post('/impresion', [LoteImpresionController::class, 'store'])->name('impresion.store');
    Route::get('/impresion/{lote}', [LoteImpresionController::class, 'show'])->name('impresion.show');
    Route::post('/impresion/{lote}/retorno', [LoteImpresionController::class, 'registrarRetorno'])->name('impresion.retorno');

    Route::get('/setec', [LoteSetecController::class, 'index'])->name('setec.index');
    Route::get('/setec/crear', [LoteSetecController::class, 'create'])->name('setec.create');
    Route::post('/setec', [LoteSetecController::class, 'store'])->name('setec.store');
    Route::get('/setec/{lote}', [LoteSetecController::class, 'show'])->name('setec.show');
    Route::post('/setec/detalle/{detalle}/certificacion', [LoteSetecController::class, 'registrarCertificacion'])->name('setec.certificacion');
    Route::post('/setec/{lote}/retorno', [LoteSetecController::class, 'registrarRetorno'])->name('setec.retorno');

    Route::get('/entrega', [EntregaController::class, 'index'])->name('entrega.index');
    Route::get('/entrega/{titulo}', [EntregaController::class, 'show'])->name('entrega.show');
    Route::post('/entrega/{titulo}', [EntregaController::class, 'entregar'])->name('entrega.entregar');

    Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
