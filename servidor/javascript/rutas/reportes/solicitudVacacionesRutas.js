"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const solicitudVacacionControlador_1 = __importDefault(require("../../controlador/reportes/solicitudVacacionControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class SolicitudVacacionesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REPORTE DE SOLICITUDES DE VACACIONES
        this.router.put('/vacaciones-solicitudes/:desde/:hasta', verificarToken_1.TokenValidation, solicitudVacacionControlador_1.default.ReporteVacacionesMultiple);
    }
}
const VACACIONES_REPORTE_RUTAS = new SolicitudVacacionesRutas();
exports.default = VACACIONES_REPORTE_RUTAS.router;
