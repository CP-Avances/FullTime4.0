"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const reportesFaltasControlador_1 = __importDefault(require("../../controlador/reportes/reportesFaltasControlador"));
class FaltasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE BUSQUEDA DE DATOS DE FALTAS
        this.router.post('/faltas/:desde/:hasta', verificarToken_1.TokenValidation, reportesFaltasControlador_1.default.ReporteFaltas);
    }
}
const FALTAS_RUTAS = new FaltasRutas();
exports.default = FALTAS_RUTAS.router;
