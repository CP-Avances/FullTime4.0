export interface ReporteSalidaAntes {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<depa_sal>
}

interface depa_sal {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_sal>
}

interface emp_sal {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    timbres?: Array<timbre> | Array<tim_tabulado>,
}

export interface timbre {
    fecha: string,
    hora: string,
}

export interface tim_tabulado {
    fecha: string,
    hora: string,
}