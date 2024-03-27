"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Peri_vacaciones {
    constructor(estado, fec_final, fec_inicio, descripcion, dia_perdido, dia_vacacion, min_vacaciones, dia_antiguedad, horas_vacaciones, id_empl_contrato) {
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
    getId_empl_contrato() {
        return this._id_empl_contrato;
    }
    setId_empl_contrato(id_empl_contrato) {
        this._id_empl_contrato = id_empl_contrato;
    }
}
exports.default = Peri_vacaciones;
