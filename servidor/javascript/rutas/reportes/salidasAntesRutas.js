"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const salidaAntesControlador_1 = __importDefault(require("../../controlador/reportes/salidaAntesControlador"));
class SalidasAnticipadasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // CONSULTA DE TIMBRES CON SALIDAS ANTICIPADAS   **USADO
        this.router.post('/timbre-salida-anticipada/:desde/:hasta', verificarToken_1.TokenValidation, salidaAntesControlador_1.default.ReporteSalidasAnticipadas);
    }
}
const SALIDAS_ANTICIPADAS_RUTAS = new SalidasAnticipadasRutas();
exports.default = SALIDAS_ANTICIPADAS_RUTAS.router;
