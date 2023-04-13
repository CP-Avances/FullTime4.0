"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cargaMultipleControlador_1 = __importDefault(require("../../controlador/cargaMultiple/cargaMultipleControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class DetallePlanHorarioRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/upload', verificarToken_1.TokenValidation, multipartMiddleware, cargaMultipleControlador_1.default.CargaMultiple);
        this.router.post('/horarioFijo/upload', verificarToken_1.TokenValidation, multipartMiddleware, cargaMultipleControlador_1.default.CargarHorarioMultiplesEmpleados);
    }
}
const DETALLE_PLAN_HORARIO_RUTAS = new DetallePlanHorarioRutas();
exports.default = DETALLE_PLAN_HORARIO_RUTAS.router;
