export interface ReporteFaltas {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<depa_fal>
}

interface depa_fal {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_fal>
}

interface emp_fal {
    id: number,
    cargo?: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    timbres?: Array<timbre> | Array<tim_tabulado>,
    contrato?: string,
    name_empleado: string,
}

export interface timbre {
    hora: string,
    fecha: string,
}

export interface tim_tabulado {
    hora: string,
    fecha: string,
}