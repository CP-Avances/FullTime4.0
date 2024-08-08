"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const reporteVacunasControlador_1 = __importDefault(require("../../controlador/reportes/reporteVacunasControlador"));
class ReportesAsistenciasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE BUSQUEDA DE DATOS DE VACUNAS    **USADO
        this.router.post('/vacunas-multiples/', verificarToken_1.TokenValidation, reporteVacunasControlador_1.default.ReporteVacunasMultiple);
    }
}
const VACUNAS_REPORTE_RUTAS = new ReportesAsistenciasRutas();
exports.default = VACUNAS_REPORTE_RUTAS.router;
