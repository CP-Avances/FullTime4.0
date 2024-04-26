
export default class Peri_vacaciones {
    
    public estado: number;
    public fec_final: Date;
    public fec_inicio: Date;
    public descripcion: string;
    public dia_perdido: number;
    public dia_vacacion: number;
    public min_vacaciones: number
    public dia_antiguedad: number;
    public horas_vacaciones: number;
    public _id_empl_contrato: number;

    constructor(
        estado: number,
        fec_final: Date,
        fec_inicio: Date,
        descripcion: string,
        dia_perdido: number,
        dia_vacacion: number,
        min_vacaciones: number,
        dia_antiguedad: number,
        horas_vacaciones: number,
        id_empl_contrato: number, 
    ) {
        this.estado = estado;
        this.fec_final = fec_final;
        this.fec_inicio = fec_inicio;
        this.dia_perdido = dia_perdido;
        this.descripcion = descripcion;
        this.dia_vacacion = dia_vacacion;
        this.min_vacaciones = min_vacaciones;
        this.dia_antiguedad = dia_antiguedad;
        this.horas_vacaciones = horas_vacaciones;
        this._id_empl_contrato = id_empl_contrato; 
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
    acumulado: number,
    anios_labo: number,
    fecha_ingreso: Date,
    dia_adicional: number,
    inicio_Ultimo_Periodo: Date
}