<?php

namespace App\Services;

use App\Models\DetalleTituloSetec;
use App\Models\LoteImpresion;
use App\Models\LoteSetec;
use App\Models\ProcesoTitulo;
use App\Models\Titulacion;
use App\Models\TituloFisico;

class ReporteService
{
    /**
     * Títulos según ubicación (fuente autoritativa).
     */
    public function porUbicacion(string $ubicacion)
    {
        return TituloFisico::where('ubicacion_actual', $ubicacion)
            ->with('titulacion.graduado')
            ->latest()
            ->get();
    }

    /**
     * Procesos con SLA vencido (más de 45 días) y no finalizados.
     */
    public function alertasSlaVencido()
    {
        return ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')
            ->where('titulo_entregado_graduado', false)
            ->whereNotNull('fecha_limite_sla')
            ->where('fecha_limite_sla', '<', now())
            ->get()
            ->filter(fn (ProcesoTitulo $p) => $p->slaVencido())
            ->values();
    }

    /**
     * Títulos en cualquier ubicación distinta a ENTREGADO (en curso).
     */
    public function enProceso()
    {
        return TituloFisico::where('ubicacion_actual', '!=', 'ENTREGADO')
            ->with('titulacion.graduado')
            ->latest()
            ->get();
    }

    /**
     * Padrón oficial de graduados y titulados con filtros demográficos.
     */
    public function padronGraduados(?string $carrera = null, ?string $desde = null, ?string $hasta = null, ?string $q = null)
    {
        return Titulacion::with('graduado', 'tituloFisico', 'proceso')
            ->when($carrera && $carrera !== 'todas', fn ($query) => $query->where('carrera', $carrera))
            ->when($desde, fn ($query) => $query->whereDate('fecha_titulacion', '>=', $desde))
            ->when($hasta, fn ($query) => $query->whereDate('fecha_titulacion', '<=', $hasta))
            ->when($q, function ($query, $search) {
                $query->where(function ($sub) use ($search) {
                    $sub->whereHas('graduado', fn ($g) => $g->where('nombre_completo', 'like', "%{$search}%")
                        ->orWhere('cedula', 'like', "%{$search}%")
                        ->orWhere('carnet', 'like', "%{$search}%"))
                        ->orWhere('carrera', 'like', "%{$search}%")
                        ->orWhere('titulo_obtenido', 'like', "%{$search}%");
                });
            })
            ->latest('fecha_titulacion')
            ->get();
    }

    /**
     * Libro oficial de registro universitario (ordenado por Tomo, Folio, Libro y N.º Título).
     */
    public function libroRegistro(?string $desde = null, ?string $hasta = null, ?string $q = null)
    {
        return TituloFisico::with('titulacion.graduado')
            ->when($desde, fn ($query) => $query->whereDate('created_at', '>=', $desde))
            ->when($hasta, fn ($query) => $query->whereDate('created_at', '<=', $hasta))
            ->when($q, function ($query, $search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('numero_titulo', 'like', "%{$search}%")
                        ->orWhere('libro', 'like', "%{$search}%")
                        ->orWhere('tomo', 'like', "%{$search}%")
                        ->orWhere('folio', 'like', "%{$search}%")
                        ->orWhereHas('titulacion.graduado', fn ($g) => $g->where('nombre_completo', 'like', "%{$search}%")
                            ->orWhere('cedula', 'like', "%{$search}%"));
                });
            })
            ->orderBy('tomo')
            ->orderBy('folio')
            ->orderBy('numero_titulo')
            ->get();
    }

    /**
     * Histórico de lotes y traslados de custodia (Imprenta y SETEC).
     */
    public function custodiaLotes(?string $tipoLote = null)
    {
        $lotesImprenta = collect();
        $lotesSetec = collect();

        if (! $tipoLote || $tipoLote === 'todos' || $tipoLote === 'imprenta') {
            $lotesImprenta = LoteImpresion::with('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio', 'responsableRecepcion')
                ->latest()
                ->get()
                ->map(fn ($l) => [
                    'id' => $l->id,
                    'tipo' => 'IMPRENTA',
                    'numero_lote' => $l->numero_lote,
                    'fecha_envio' => $l->fecha_envio,
                    'fecha_retorno' => $l->fecha_retorno,
                    'total_titulos' => $l->detalle->count(),
                    'estado' => $l->estado,
                    'responsable_envio' => $l->responsableEnvio?->name,
                    'responsable_recepcion' => $l->responsableRecepcion?->name,
                    'observaciones' => $l->observaciones,
                ]);
        }

        if (! $tipoLote || $tipoLote === 'todos' || $tipoLote === 'setec') {
            $lotesSetec = LoteSetec::with('detalle.tituloFisico.titulacion.graduado', 'responsableEnvio', 'responsableRecepcion')
                ->latest()
                ->get()
                ->map(fn ($l) => [
                    'id' => $l->id,
                    'tipo' => 'SETEC',
                    'numero_lote' => $l->numero_lote,
                    'fecha_envio' => $l->fecha_envio,
                    'fecha_retorno' => $l->fecha_retorno,
                    'total_titulos' => $l->detalle->count(),
                    'estado' => $l->estado,
                    'responsable_envio' => $l->responsableEnvio?->name,
                    'responsable_recepcion' => $l->responsableRecepcion?->name,
                    'observaciones' => $l->observaciones,
                ]);
        }

        return $lotesImprenta->concat($lotesSetec)->sortByDesc('fecha_envio')->values();
    }

    /**
     * Auditoría de cumplimiento de SLA legal de 45 días.
     */
    public function auditoriaSla(?string $carrera = null)
    {
        return ProcesoTitulo::with('titulacion.graduado', 'titulacion.tituloFisico')
            ->when($carrera && $carrera !== 'todas', fn ($query) => $query->whereHas('titulacion', fn ($t) => $t->where('carrera', $carrera)))
            ->latest()
            ->get();
    }

    /**
     * Reporte de incidencias, títulos observados y no recibidos por SETEC.
     */
    public function incidenciasSetec()
    {
        return DetalleTituloSetec::with('lote', 'tituloFisico.titulacion.graduado')
            ->whereIn('estado', ['OBSERVADO', 'NO_RECIBIDO'])
            ->latest('fecha_certificacion')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'lote' => $d->lote?->numero_lote,
                'numero_titulo' => $d->tituloFisico?->numero_titulo,
                'graduado' => $d->tituloFisico?->titulacion?->graduado?->nombre_completo,
                'cedula' => $d->tituloFisico?->titulacion?->graduado?->cedula,
                'carrera' => $d->tituloFisico?->titulacion?->carrera,
                'estado' => $d->estado,
                'observacion' => $d->observacion,
                'fecha_dictamen' => $d->fecha_certificacion,
            ]);
    }
}
