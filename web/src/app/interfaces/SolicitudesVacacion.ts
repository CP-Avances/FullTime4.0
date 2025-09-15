export interface SolicitudVacacion {
    id?: number;
    id_empleado: number;
    id_cargo_vigente: number;
    id_periodo_vacacion: number;
    fecha_inicio: string;
    fecha_final: string;
    estado: string;
    numero_dias_lunes: number;
    numero_dias_martes: number;
    numero_dias_miercoles: number;
    numero_dias_jueves: number;
    numero_dias_viernes: number;
    numero_dias_sabado: number;
    numero_dias_domingo: number;
    numero_dias_totales: number;
    incluir_feriados: boolean;
    documento?: string;
    minutos_totales: number;
    fecha_registro?: string;
    fecha_actualizacion?: string;
}