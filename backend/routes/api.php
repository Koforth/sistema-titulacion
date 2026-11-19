<?php

use App\Http\Controllers\Api\V1;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Público (con límite de peticiones para evitar enumeración/abuso)
    Route::middleware('throttle:30,1')->prefix('publico')->group(function () {
        Route::get('estadisticas', [V1\ConsultaPublicaController::class, 'estadisticas']);
        Route::get('buscar', [V1\ConsultaPublicaController::class, 'buscar']);
        Route::get('verificar/{uuid}', [V1\ConsultaPublicaController::class, 'verificar']);
    });

    Route::post('auth/login', [V1\AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
        Route::get('auth/me', [V1\AuthController::class, 'me']);
        Route::post('auth/logout', [V1\AuthController::class, 'logout']);

        // Lectura: admin, operador y consulta
        Route::get('dashboard', V1\DashboardController::class);
        Route::get('reportes', V1\ReporteController::class);
        Route::get('graduados', [V1\GraduadoController::class, 'index']);
        Route::get('graduados/{graduado}', [V1\GraduadoController::class, 'show']);
        Route::get('titulaciones', [V1\TitulacionController::class, 'index']);
        Route::get('titulaciones/{titulacion}', [V1\TitulacionController::class, 'show']);
        Route::get('procesos-titulo', [V1\ProcesoTituloController::class, 'index']);
        Route::get('procesos-titulo/{proceso}', [V1\ProcesoTituloController::class, 'show']);
        Route::get('titulos-fisicos', [V1\TituloFisicoController::class, 'index']);
        Route::get('titulos-fisicos/disponibles', [V1\TituloFisicoController::class, 'disponibles']);
        Route::get('titulos-fisicos/{titulo}', [V1\TituloFisicoController::class, 'show']);
        Route::get('titulos-fisicos/{titulo}/historial', [V1\TituloFisicoController::class, 'historial']);
        Route::get('impresion', [V1\LoteImpresionController::class, 'index']);
        Route::get('impresion/disponibles', [V1\LoteImpresionController::class, 'disponibles']);
        Route::get('impresion/{lote}', [V1\LoteImpresionController::class, 'show']);
        Route::get('setec', [V1\LoteSetecController::class, 'index']);
        Route::get('setec/disponibles', [V1\LoteSetecController::class, 'disponibles']);
        Route::get('setec/{lote}', [V1\LoteSetecController::class, 'show']);
        Route::get('entrega', [V1\EntregaController::class, 'index']);
        Route::get('entrega/{titulo}', [V1\EntregaController::class, 'show']);

        // Escritura: admin y operador
        Route::middleware('role:admin,operador')->group(function () {
            Route::post('graduados', [V1\GraduadoController::class, 'store']);
            Route::put('graduados/{graduado}', [V1\GraduadoController::class, 'update']);
            Route::post('titulaciones', [V1\TitulacionController::class, 'store']);
            Route::put('titulaciones/{titulacion}', [V1\TitulacionController::class, 'update']);
            Route::post('titulaciones/{titulacion}/crear-proceso', [V1\ProcesoTituloController::class, 'crearParaTitulacion']);
            Route::post('procesos-titulo/{proceso}/marcar-etapa', [V1\ProcesoTituloController::class, 'marcarEtapa']);
            Route::post('titulos-fisicos', [V1\TituloFisicoController::class, 'store']);
            Route::put('titulos-fisicos/{titulo}', [V1\TituloFisicoController::class, 'update']);
            Route::post('titulos-fisicos/{titulo}/regenerar-qr', [V1\TituloFisicoController::class, 'regenerarQr']);
            Route::post('impresion', [V1\LoteImpresionController::class, 'store']);
            Route::post('impresion/{lote}/retorno', [V1\LoteImpresionController::class, 'registrarRetorno']);
            Route::post('setec', [V1\LoteSetecController::class, 'store']);
            Route::post('setec/detalle/{detalle}/certificacion', [V1\LoteSetecController::class, 'registrarCertificacion']);
            Route::post('setec/{lote}/retorno', [V1\LoteSetecController::class, 'registrarRetorno']);
            Route::post('entrega/{titulo}', [V1\EntregaController::class, 'entregar']);
        });

        // Eliminación: solo admin
        Route::middleware('role:admin')->group(function () {
            Route::delete('graduados/{graduado}', [V1\GraduadoController::class, 'destroy']);
            Route::delete('titulaciones/{titulacion}', [V1\TitulacionController::class, 'destroy']);
        });
    });
});
