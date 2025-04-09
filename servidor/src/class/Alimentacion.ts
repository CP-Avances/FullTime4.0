export interface ReporteAlimentacion {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<depa_alimentacion>
}

interface depa_alimentacion {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_alimentacion>
}

interface emp_alimentacion {
    id: number,
    cedula: string,
    codigo: string | number,
    cargo?: string,
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