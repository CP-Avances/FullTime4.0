"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const reportesTiempoLaboradoControlador_1 = __importDefault(require("../../controlador/reportes/reportesTiempoLaboradoControlador"));
class ReportesTiempoAlimentacionRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REPORTES DE ATRASOS
        this.router.put('/tiempo-laborado-empleados/:desde/:hasta', verificarToken_1.TokenValidation, reportesTiempoLaboradoControlador_1.default.ReporteTiempoLaborado);
        this.router.put('/tiempo-laborado-empleados-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesTiempoLaboradoControlador_1.default.ReporteTiempoLaboradoRegimenCargo);
    }
}
const REPORTES_TIEMPO_ALIMENTACION_RUTAS = new ReportesTiempoAlimentacionRutas();
exports.default = REPORTES_TIEMPO_ALIMENTACION_RUTAS.router;
