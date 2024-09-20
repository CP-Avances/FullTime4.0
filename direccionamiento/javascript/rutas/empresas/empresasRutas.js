"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empresasControlador_1 = __importDefault(require("../../controlador/empresas/empresasControlador"));
class EmpresasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/', empresasControlador_1.default.ObtenerEmpresas);
    }
}
const EMPRESAS_RUTAS = new EmpresasRutas();
exports.default = EMPRESAS_RUTAS.router;
