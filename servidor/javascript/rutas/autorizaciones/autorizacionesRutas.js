"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autorizacionesControlador_1 = __importDefault(require("../../controlador/autorizaciones/autorizacionesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.CrearAutorizacion);
    }
}
const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = AUTORIZA_DEPARTAMENTO_RUTAS.router;
