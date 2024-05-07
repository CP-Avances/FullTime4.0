"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const reportesTiempoLaboradoControlador_1 = __importDefault(require("../../controlador/reportes/reportesTiempoLaboradoControlador"));
class ReportesTiempoLaboradoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
        this.router.put('/tiempo-laborado-empleados/:desde/:hasta', verificarToken_1.TokenValidation, reportesTiempoLaboradoControlador_1.default.ReporteTiempoLaborado);
        // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO LISTA sucursales[empleados]]
        this.router.put('/tiempo-laborado-empleados-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesTiempoLaboradoControlador_1.default.ReporteTiempoLaboradoRegimenCargo);
    }
}
const REPORTES_TIEMPO_LABORADO_RUTAS = new ReportesTiempoLaboradoRutas();
exports.default = REPORTES_TIEMPO_LABORADO_RUTAS.router;
