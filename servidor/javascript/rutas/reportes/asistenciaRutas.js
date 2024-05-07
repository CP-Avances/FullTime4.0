"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asistenciaControlador_1 = __importDefault(require("../../controlador/reportes/asistenciaControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class AsistenciaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/lista-empleados/:id_empresa', verificarToken_1.TokenValidation, asistenciaControlador_1.default.ObtenerListaEmpresa);
    }
}
const ASISTENCIA_RUTAS = new AsistenciaRutas();
exports.default = ASISTENCIA_RUTAS.router;
