export type Role = 'admin' | 'operador' | 'consulta';
export interface User { id: number; name: string; email: string; role: Role }

export interface Graduado {
  id: number;
  tipo_identidad?: string;
  carnet?: string;
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  nombre_completo: string;
  sexo?: string;
  pais?: string;
  estado_civil?: string;
  etnia?: string;
  departamento_origen?: string;
  municipio_origen?: string;
  departamento_residencia?: string;
  municipio_residencia?: string;
  direccion_residencia?: string;
  email?: string;
  telefono?: string;
  anio_bachillerato?: string;
  tipo_bachillerato?: string;
  turno_bachillerato?: string;
  modalidad_bachillerato?: string;
  titulaciones_count?: number;
  titulaciones?: Titulacion[];
}

export interface Titulacion {
  id: number;
  graduado_id: number;
  carrera: string;
  titulo_obtenido?: string;
  anio_inicio_estudio?: string;
  anio_fin_estudio?: string;
  anio_graduacion?: string;
  registrado_no?: string;
  folio?: string;
  tomo_registro?: string;
  fecha_emision_titulo?: string;
  sede?: string;
  duracion_anios?: string;
  numero_asignaturas?: string;
  programa_especial?: string;
  forma_culminacion?: string;
  numero_gaceta?: string;
  pagina_gaceta?: string;
  fecha_gaceta?: string;
  acceso_internet?: boolean;
  tipo_acceso_internet?: string;
  empresa_acceso_internet?: string;
  fecha_registro_setec?: string;
  registrador?: string;
  fecha_titulacion?: string;
  modalidad?: string;
  estado?: string;
  graduado?: Graduado;
  proceso?: { id: number } | null;
  titulo_fisico?: TituloFisico | null;
}

export interface TituloFisico {
  id: number;
  uuid: string;
  numero_titulo: string;
  ubicacion_actual: string;
  libro?: string;
  tomo?: string;
  folio?: string;
  calidad?: string;
  observaciones?: string;
  titulacion?: Titulacion;
  historial?: Historial[];
}

export interface ResumenUbicaciones {
  leon: number;
  imprenta: number;
  setec: number;
  entregado: number;
  total: number;
}

export interface Historial {
  id: number;
  accion?: string;
  tipo_evento?: string;
  fecha?: string;
  descripcion?: string;
  created_at: string;
  usuario?: { name: string } | null;
}

export interface LoteDetalle {
  id: number;
  lote_impresion_id?: number;
  lote_setec_id?: number;
  titulo_fisico_id: number;
  estado?: string;
  observacion?: string;
  fecha_certificacion?: string;
  titulo_fisico?: TituloFisico;
  tituloFisico?: TituloFisico;
}

export interface Lote {
  id: number;
  numero_lote: string;
  fecha_envio?: string;
  fecha_retorno?: string;
  responsable_envio_id?: number;
  responsable_recepcion_id?: number;
  responsable_envio?: User;
  responsable_recepcion?: User;
  responsableEnvio?: User;
  responsableRecepcion?: User;
  estado?: string;
  observaciones?: string;
  created_at: string;
  detalle?: LoteDetalle[];
}

export interface Proceso {
  id: number;
  titulacion_id: number;
  solicitado_estudiante?: boolean;
  expediente_completo?: boolean;
  elaboracion_bd?: boolean;
  elaboracion_titulo?: boolean;
  doc_certificacion?: boolean;
  en_gaceta?: boolean;
  titulo_entregado_graduado?: boolean;
  titulo_anulado?: boolean;
  titulo_rechazado?: boolean;
  otro?: boolean;
  pendiente?: boolean;
  en_revision?: boolean;
  revisado?: boolean;
  validado?: boolean;
  entregado_estudiante?: boolean;
  fecha_inicio_sla?: string;
  fecha_limite_sla?: string;
  otro_descripcion?: string;
  dias_restantes?: number;
  sla_vencido?: boolean;
  sla_iniciado?: boolean;
  finalizado?: boolean;
  created_at?: string;
  updated_at?: string;
  titulacion?: Titulacion;
}

export interface ProcesoStats {
  total: number;
  en_tramite: number;
  en_alerta: number;
  vencidos: number;
  finalizados: number;
  etapas: Record<string, string>;
}

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

export interface TituloPublico {
  uuid: string;
  numero_titulo: string;
  estado: string;
  graduado?: string;
  carrera?: string;
  fecha_titulacion?: string;
}
