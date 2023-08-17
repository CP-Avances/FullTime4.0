export interface IReporteEmpleados {
    cargo: boolean;
    cedula: boolean;
    codigo: boolean;
    depart: boolean;
    detall: boolean;
    grupo: boolean;
    nombre: boolean;
}

export interface IRestListEmpl {
    cedula: string;
    nom_completo: string;
    codigo?: string;
    departamento?: string;
    cargo?: string;
    grupo?: string;
    detalle_grupo?: string;
}

export interface Task {
    name: string;
    completed: boolean;
    subtasks?: Task[];
}

export interface IReporteAsistenciaConsolidada {
    atraso: boolean,
    salida_antes: boolean,
    almuerzo: boolean,
    h_trab: boolean,
    h_supl: boolean,
    h_ex_LV: boolean,
    h_ex_SD: boolean
}

export interface IRestAsisteConsoli {
    fecha_mostrar: string,
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
    }
    atraso: string,
    sal_antes: string,
    almuerzo: string,
    hora_trab: string,
    hora_supl: string,
    hora_ex_L_V: string,
    hora_ex_S_D: string
}

export interface IRestTotalAsisteConsoli {
    atraso: string | number,
    sal_antes: string | number,
    almuerzo: string | number,
    hora_trab: string | number,
    hora_supl: string | number,
    hora_ex_L_V: string | number,
    hora_ex_S_D: string | number
}

export interface ITableEmpleados {
    id: number,
    nombre: string,
    codigo?: string,
    apellido?: string,
    cedula?: string,
}

export interface ItableDispositivos {
    id: number,
    nombre: string,
    apellido: string,
    id_empleado: string,
    id_dispositivo: string,
    model_dispositivo: string,
}

export interface IReporteAtrasos {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<dep>
}

export interface IReporteFaltas {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<dep>
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
    codigo: string | number
    timbres?: Array<tim>,
    genero?: string | number,
    fec_final?: string,
    cargo?: string,
    contrato?: string,
    faltas?: Array<faltas>
}

interface faltas {
    fecha: string
}

export interface tim {
    fecha: string,
    horario: string,
    timbre: string,
    atraso_dec: number,
    atraso_HHMM: string
}

/**
 * INTERFAZ PARA REPORTE DE HORAS TRABAJADAS
 */

export interface IReporteHorasTrabaja {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<departamento>
}

interface departamento {
    id_depa: number,
    name_dep: string,
    empleado: Array<empleado>
}

interface empleado {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: string | number
    timbres?: Array<hora_trab>,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
}

export interface hora_trab {
    fecha: string,
    horarios: Array<horarios>,
    total_horario: string,
    total_timbres: string,
    total_diferencia: string,
}

export interface horarios {
    hora_diferencia: string,
    hora_horario: string,
    hora_timbre: string,
    accion: string,
    observacion: string
}

/**
 * Para Reporte Puntualidad
 */

export interface IReportePuntualidad {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<dep_puntualidad>
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
    puntualidad?: string | number,
    color: string
}

export interface model_pdf_puntualidad {
    name_empleado: string,
    cedula: string,
    codigo: string | number,
    ciudad: string,
    name_dep: string,
    cargo: string,
    contrato: string,
    puntualidad: string | number,
    color: string
}

/**
 * Para Reporte TIMBRES
 */

export interface IReporteTimbres {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<dep_tim>
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
    timbres?: Array<timbre | tim_tabulado>
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

/**
 * Para Reporte TIMBRES
 */

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


/**
 * INTERFACES DE AYUDA
 */

export interface rango {
    fec_inico: string,
    fec_final: string
}

export interface checkOptions {
    opcion: string,
    valor: string
}

export interface FormCriteriosBusqueda {
    bool_suc?: boolean;
    bool_dep: boolean;
    bool_emp: boolean;
    bool_tab?: boolean;
    bool_inc?: boolean;
    bool_cargo?: boolean;
}

// REPORTE DE VACUNAS

export interface ReporteVacunas {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<dep_vac>
}

interface dep_vac {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_vac>
}

interface emp_vac {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    vacunas?: Array<vacuna>
}

export interface vacuna {
    id_tipo_vacuna_1: string,
    id_tipo_vacuna_2: string,
    id_tipo_vacuna_3: string,
    carnet: string,
    nom_carnet: string,
    dosis_1: boolean | string | null,
    dosis_2: boolean | string | null,
    dosis_3: boolean | string | null,
    fecha_1: string,
    fecha_2: string,
    fecha_3: string,
}

// REPORTE DE SOLICITUD DE VACACIONES
export interface ReporteVacacion {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<depa_vac>
}

interface depa_vac {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_vac>
}

interface emp_vac {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    vacaciones?: Array<vacacion>,
}

export interface vacacion {
    fec_inicio: string,
    fec_final: string,
    fec_ingreso: string,
    id_vacacion: number,
    id_documento: string,
}

// REPORTE DE HORAS EXTRAS
export interface ReporteHoraExtra {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<depa_he>
}

interface depa_he {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_he>
}

interface emp_he {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    horaE?: Array<hora>,
}

export interface hora {
    fecha_desde: string,
    fecha_hasta: string,
    hora_inicio: string,
    hora_fin: string,
    descripcion: string,
    horas_totales: string,
    planifica_nombre: string,
    planifica_apellido: string,
}
