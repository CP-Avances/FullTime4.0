"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reporteHoraExtraControlador_1 = __importDefault(require("../../controlador/reportes/reporteHoraExtraControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class ReporteHoraExtraRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/:id_empleado/:desde/:hasta', verificarToken_1.TokenValidation, reporteHoraExtraControlador_1.default.ReporteHorasExtras);
    }
}
const REPORTE_HORA_EXTRA_RUTAS = new ReporteHoraExtraRutas();
exports.default = REPORTE_HORA_EXTRA_RUTAS.router;
