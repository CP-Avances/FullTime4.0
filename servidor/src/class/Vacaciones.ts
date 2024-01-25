export interface ReporteVacacion {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<depa_vac>
}

interface depa_vac {
    id_depa: number,
    empleado: Array<emp_vac>
    name_dep: string,
}

interface emp_vac {
    id: number,
    cargo?: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    contrato?: string,
    vacaciones?: Array<vacacion>,
    name_empleado: string,
}

export interface vacacion{
    fec_final: string,
    fec_inicio: string,
    fec_ingreso: string,
    id_vacacion: number,
    id_documento: string,
}
