export interface ReporteVacuna {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<depa_vac>
}

interface depa_vac {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_vac>
}

interface emp_vac {
    id: number,
    cargo?: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    vacunas?: Array<vacuna>,
    contrato?: string,
    name_empleado: string,
}

export interface vacuna {
    id_tipo_vacuna_1: string,
    id_tipo_vacuna_2: string,
    id_tipo_vacuna_3: string,
    carnet: string,
    dosis_1: boolean | string | null,
    dosis_2: boolean | string | null,
    dosis_3: boolean | string | null,
    fecha_1: string,
    fecha_2: string,
    fecha_3: string,
}
