export interface ReporteTiempoLaborado {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<depa_tiempo>
}

interface depa_tiempo {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_tiempo>
}

interface emp_tiempo {
    id: number,
    cargo?: string,
    identificacion: string,
    codigo: string | number,
    genero?: string | number,
    timbres?:  Array<any>
    contrato?: string,
    name_empleado: string,
}
