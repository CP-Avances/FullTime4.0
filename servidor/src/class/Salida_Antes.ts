export interface ReporteSalidaAntes {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<depa_sal>
}

interface depa_sal {
    id_depa: number,
    empleado: Array<emp_sal>
    name_dep: string,
}

interface emp_sal {
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