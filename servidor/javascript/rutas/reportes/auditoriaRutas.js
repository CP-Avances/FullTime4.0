"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auditoriaControlador_1 = __importDefault(require("../../controlador/reportes/auditoriaControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class AuditoriaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR DATOS EMPAQUETADOS - AUDITORIA     **USADO
        this.router.post('/auditarportablaempaquetados', verificarToken_1.TokenValidation, auditoriaControlador_1.default.BuscarDatosAuditoriaporTablasEmpaquetados);
        // METODO DE CONSULTA DE AUDITORIA DE INICIO DE SESION
        this.router.post('/auditarAccesos', verificarToken_1.TokenValidation, auditoriaControlador_1.default.BuscarDatosAuditoriaAcceso);
    }
}
const AUDITORIA_RUTAS = new AuditoriaRutas();
exports.default = AUDITORIA_RUTAS.router;
