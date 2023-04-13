export interface ReporteHoraExtra {
    id_suc: number,
    name_suc: string,
    ciudad: string,
    departamentos: Array<depa_he>
}

interface depa_he {
    id_depa: number,
    name_dep: string,
    empleado: Array<emp_he>
}

interface emp_he {
    id: number,
    name_empleado: string,
    cedula: string,
    codigo: number,
    genero?: string | number,
    cargo?: string,
    contrato?: string,
    horaE?: Array<hora>,
}

export interface hora {
    fecha_desde: string,
    fecha_hasta: string,
    hora_inicio: string,
    hora_fin: string,
    descripcion: string,
    horas_totales: string,
    planifica_nombre: string,
    planifica_apellido: string,
}