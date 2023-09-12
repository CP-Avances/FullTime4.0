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
    codigo: string | number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    vacaciones?: Array<vacacion>,
}

export interface vacacion{
    fec_inicio: string,
    fec_final: string,
    fec_ingreso: string,
    id_vacacion: number,
    id_documento: string,
}
