
export default class Peri_vacaciones {
    
    public _id_empl_contrato: number;
    public descripcion: string;
    public dia_vacacion: number;
    public dia_antiguedad: number;
    public estado: number;
    public fec_inicio: Date;
    public fec_final: Date;
    public dia_perdido: number;
    public horas_vacaciones: number;
    public min_vacaciones: number

    constructor(
        id_empl_contrato: number, 
        descripcion: string,
        dia_vacacion: number,
        dia_antiguedad: number,
        estado: number,
        fec_inicio: Date,
        fec_final: Date,
        dia_perdido: number,
        horas_vacaciones: number,
        min_vacaciones: number
    ) {
        this._id_empl_contrato = id_empl_contrato; 
        this.descripcion = descripcion;
        this.dia_vacacion = dia_vacacion;
        this.dia_antiguedad = dia_antiguedad;
        this.estado = estado;
        this.fec_inicio = fec_inicio;
        this.fec_final = fec_final;
        this.dia_perdido = dia_perdido;
        this.horas_vacaciones = horas_vacaciones;
        this.min_vacaciones = min_vacaciones;
    }


    public getId_empl_contrato() {
        return this._id_empl_contrato;
    }

    public setId_empl_contrato(id_empl_contrato: number) {
        this._id_empl_contrato = id_empl_contrato
    }

}

export interface VacacionesDiasCalendario {
    periodo: string,
    detalle: string,
    desde: string,
    hasta: string,
    descuento: { 
        dias: number,
        horas: number,
        min: number
    },
    saldo: { 
        dias: number,
        horas: number,
        min: number
    }
}

export interface InfoLabora {
    anio: number, 
    adicional: number
}

export interface IAcumulado {
    fecha_ingreso: Date,
    acumulado: number,
    anios_labo: number,
    dia_adicional: number,
    inicio_Ultimo_Periodo: Date
}