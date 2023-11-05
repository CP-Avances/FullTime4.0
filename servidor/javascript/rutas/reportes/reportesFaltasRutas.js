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
        // CONSULTA DE TIMBRES CON SALIDAS ANTICIPADAS
        this.router.put('/faltas/:desde/:hasta', verificarToken_1.TokenValidation, reportesFaltasControlador_1.default.ReporteFaltas);
        // CONSULTA DE TIMBRES CON SALIDAS ANTICIPADAS PARA REGIMEN CARGO
        this.router.put('/faltas-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesFaltasControlador_1.default.ReporteFaltasRegimenCargo);
    }
}
const FALTAS_RUTAS = new FaltasRutas();
exports.default = FALTAS_RUTAS.router;
