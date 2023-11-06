export interface ReporteTiempoLaborado {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<depa_tiempo>
}

interface depa_tiempo {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_tiempo>
}

interface emp_tiempo {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: string | number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    timbres?:  Array<any>
}