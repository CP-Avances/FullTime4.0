export interface ReporteVacuna {
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
    codigo: string | number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    vacunas?: Array<vacuna>,
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
