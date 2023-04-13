"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Peri_vacaciones {
    constructor(id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones) {
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
    getId_empl_contrato() {
        return this._id_empl_contrato;
    }
    setId_empl_contrato(id_empl_contrato) {
        this._id_empl_contrato = id_empl_contrato;
    }
}
exports.default = Peri_vacaciones;
