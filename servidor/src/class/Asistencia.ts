export interface ITiempoLaboral{
    id_horario: number,
    min_almuerzo: number,
    datos: any[]
}
// h_ingreso: Date,
// min_almuerzo: number,
// h_trabaja: number

export interface IAsistenciaDetalle  {
    fecha: string,
    fecha_mostrar: string
    E: {
        hora_default: string,
        hora_timbre: string,
        descripcion: string
    },
    S_A: {
        hora_default: string,
        hora_timbre: string,
        descripcion: string
    },
    E_A: {
        hora_default: string,
        hora_timbre: string,
        descripcion: string
    },
    S: {
        hora_default: string,
        hora_timbre: string,
        descripcion: string
    },
    atraso: string,
    sal_antes: string,
    almuerzo: string,
    hora_trab: string,
    hora_supl: string,
    hora_ex_L_V: string,
    hora_ex_S_D: string
}

export interface IReporteAtrasos {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array <dep>
}

export interface dep {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp>
}

export interface emp {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    timbres?: Array<any>,
    faltas?: Array<any>
}

export interface tim {
    horario: string,
    timbre: string,
    atraso_dec: number,
    atraso_HHMM: string
}

export interface IHorarioTrabajo {
    fecha: string,
    horarios: Array<any>,
    total_timbres: string,
    total_horario?: string,
    total_diferencia?: string,
    timbres?: Array<any>
}


/**
 * Para Reporte Puntualidad
 */

export interface IReportePuntualidad {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array <dep_puntualidad>
}

export interface dep_puntualidad {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_puntualidad>
}

export interface emp_puntualidad {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    puntualidad?: Array<any> | number,
    color: string
}

/**
 * Para Reporte TIMBRES
 */

export interface IReporteTimbres {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array <dep_tim>
}

interface dep_tim {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_tim>
}

interface emp_tim {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    timbres?: Array<timbre> | Array <tim_tabulado>,
}

export interface timbre {
    fec_hora_timbre: string, 
    id_reloj: number, 
    accion: string, 
    observacion: string, 
    latitud: string | number, 
    longitud: string | number
}

export interface tim_tabulado {
    fecha: string,
    entrada: string,
    salida: string,
    ent_Alm: string,
    sal_Alm: string,
    desconocido: string
}


// TIMBRE INCOMPLETO
export interface IReporteTimbresIncompletos {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<dep_tim_inc>
}

interface dep_tim_inc {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_tim_inc>
}

interface emp_tim_inc {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    timbres?: Array<tim_Imcompleto>,
}

interface tim_Imcompleto {
    fecha: string,
    timbres_hora: Array<tipo_hora>
}

interface tipo_hora {
    tipo: string,
    hora: string
}