export interface ITiempoLaboral{
    datos: any[]
    id_horario: number,
    minutos_comida: number,
}

export interface IAsistenciaDetalle  {
    fecha_mostrar: string
    fecha: string,
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
    almuerzo: string,
    sal_antes: string,
    hora_trab: string,
    hora_supl: string,
    hora_ex_L_V: string,
    hora_ex_S_D: string
}

export interface IReporteAtrasos {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array <dep>
}

export interface dep {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp>
}

export interface emp {
    id: number,
    cedula: string,
    codigo: string | number,
    cargo?: string,
    genero?: string | number,
    faltas?: Array<any>
    timbres?: Array<any>,
    contrato?: string,
    name_empleado: string,
}

export interface tim {
    horario: string,
    timbre: string,
    atraso_dec: number,
    atraso_HHMM: string
}

export interface IHorarioTrabajo {
    fecha: string,
    timbres?: Array<any>
    horarios: Array<any>,
    total_timbres: string,
    total_horario?: string,
    total_diferencia?: string,
}


// PARA REPORTE DE PUNTUALIDAD

export interface IReportePuntualidad {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array <dep_puntualidad>
}

export interface dep_puntualidad {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_puntualidad>
}

export interface emp_puntualidad {
    id: number,
    color: string
    cargo?: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    contrato?: string,
    puntualidad?: Array<any> | number,
    name_empleado: string,
}

// PARA REPORTE TIMBRES

export interface IReporteTimbres {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array <dep_tim>
}

interface dep_tim {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_tim>
}

interface emp_tim {
    id: number,
    cargo?: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    timbres?: Array<timbre> | Array <tim_tabulado>,
    contrato?: string,
    name_empleado: string,
}

export interface timbre {
    accion: string, 
    latitud: string | number, 
    id_reloj: number, 
    longitud: string | number
    observacion: string, 
    fec_hora_timbre: string, 
}

export interface tim_tabulado {
    fecha: string,
    salida: string,
    entrada: string,
    ent_Alm: string,
    sal_Alm: string,
    desconocido: string
}


// PARA REPORTE DE TIMBRE INCOMPLETO

export interface IReporteTimbresIncompletos {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<dep_tim_inc>
}

interface dep_tim_inc {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_tim_inc>
}

interface emp_tim_inc {
    id: number,
    cargo?: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    timbres?: Array<tim_Imcompleto>,
    contrato?: string,
    name_empleado: string,
}

interface tim_Imcompleto {
    fecha: string,
    timbres_hora: Array<tipo_hora>
}

interface tipo_hora {
    tipo: string,
    hora: string
}