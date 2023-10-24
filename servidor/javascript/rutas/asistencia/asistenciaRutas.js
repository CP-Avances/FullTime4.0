"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asistenciaControlador_1 = __importDefault(require("../../controlador/asistencia/asistenciaControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class AsistenciaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/buscar-asistencia', verificarToken_1.TokenValidation, asistenciaControlador_1.default.BuscarAsistencia);
    }
}
const ASISTENCIA_USUARIOS_RUTAS = new AsistenciaRutas();
exports.default = ASISTENCIA_USUARIOS_RUTAS.router;
