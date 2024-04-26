export interface ReporteHoraExtra {
    id_suc: number,
    ciudad: string,
    name_suc: string,
    departamentos: Array<depa_he>
}

interface depa_he {
    id_depa: number,
    empleado: Array<emp_he>
    name_dep: string,
}

interface emp_he {
    id: number,
    horaE?: Array<hora>,
    cargo?: string,
    codigo: string | number,
    cedula: string,
    genero?: string | number,
    contrato?: string,
    name_empleado: string,
}

export interface hora {
    hora_fin: string,
    hora_inicio: string,
    descripcion: string,
    fecha_desde: string,
    fecha_hasta: string,
    horas_totales: string,
    planifica_nombre: string,
    planifica_apellido: string,
}