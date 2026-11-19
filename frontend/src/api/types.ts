export type Role = 'admin' | 'operador' | 'consulta';
export interface User { id: number; name: string; email: string; role: Role }
export interface Graduado { id: number; carnet?: string; cedula?: string; nombre_completo: string; email?: string; telefono?: string; titulaciones_count?: number }
export interface Titulacion { id: number; graduado_id: number; carrera: string; fecha_titulacion?: string; modalidad?: string; estado?: string; graduado?: Graduado; proceso?: { id: number } | null; titulo_fisico?: TituloFisico | null }
export interface TituloFisico { id: number; uuid: string; numero_titulo: string; ubicacion_actual: string; libro?: string; tomo?: string; folio?: string; calidad?: string; observaciones?: string; titulacion?: Titulacion; historial?: Historial[] }
export interface Historial { id: number; accion?: string; descripcion?: string; created_at: string; usuario?: { name: string } | null }
export interface Lote { id: number; numero_lote: string; estado?: string; created_at: string; detalle?: { id: number; estado?: string; titulo_fisico?: TituloFisico }[] }
export interface Proceso { id: number; pendiente?: boolean; titulacion?: Titulacion }

export interface KPIItem {
  valor: number;
  label: string;
  subtext: string;
  color: 'blue' | 'orange' | 'green' | 'red';
}

export interface GraficoUbicacion {
  name: string;
  value: number;
  color: string;
}

export interface GraficoCarrera {
  name: string;
  value: number;
}

export interface GraficoFlujo {
  etapa: string;
  total: number;
}

export interface Dashboard {
  kpis: {
    total_titulos: KPIItem;
    en_proceso: KPIItem;
    entregados: KPIItem;
    sla_vencido: KPIItem;
  };
  graficos: {
    ubicaciones: GraficoUbicacion[];
    carreras: GraficoCarrera[];
    flujo_procesos: GraficoFlujo[];
  };
  counts: Record<'en_proceso' | 'en_imprenta' | 'en_setec' | 'en_leon' | 'entregados' | 'sla_vencido', number>;
  ultimos_titulos: TituloFisico[];
  procesos_recientes: Proceso[];
  servidor_tiempo?: string;
}

export interface TituloPublico { uuid: string; numero_titulo: string; estado: string; graduado?: string; carrera?: string; fecha_titulacion?: string }
