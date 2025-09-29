export interface SolicitudVacacion {
  id?: number;
  id_empleado: number;
  id_cargo_vigente: number;
  id_periodo_vacacion: number;
  fecha_inicio: string;
  fecha_final: string;
  estado: string | number;
  numero_dias_lunes: number;
  numero_dias_martes: number;
  numero_dias_miercoles: number;
  numero_dias_jueves: number;
  numero_dias_viernes: number;
  numero_dias_sabado: number;
  numero_dias_domingo: number;
  numero_dias_totales: number;
  incluir_feriados: boolean;
  documento: string;
  minutos_totales: number;
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

export interface SolicitudVacacionRequest {
  id_empleado: number;
  id_cargo_vigente: number;
  id_periodo_vacacion: number;
  fecha_inicio: string;
  fecha_final: string;
  incluir_feriados: boolean;
  num_lunes: number;
  num_martes: number;
  num_miercoles: number;
  num_jueves: number;
  num_viernes: number;
  num_sabado: number;
  num_domingo: number;
  num_dias_totales: number;
  num_horas: number;
  user_name: string;
  ip: string;
  ip_local: string;
  subir_documento: string;
  permite_horas: boolean;
}
