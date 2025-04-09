"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reportesTiempoLaboradoControlador_1 = __importDefault(require("../../controlador/reportes/reportesTiempoLaboradoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class ReportesTiempoLaboradoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO    **USADO
        this.router.post('/tiempo-laborado-empleados/:desde/:hasta', verificarToken_1.TokenValidation, reportesTiempoLaboradoControlador_1.default.ReporteTiempoLaborado);
    }
}
const REPORTES_TIEMPO_LABORADO_RUTAS = new ReportesTiempoLaboradoRutas();
exports.default = REPORTES_TIEMPO_LABORADO_RUTAS.router;
