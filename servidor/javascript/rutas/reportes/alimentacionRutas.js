"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alimentacionControlador_1 = __importDefault(require("../../controlador/reportes/alimentacionControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class AlimentacionRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // TIMBRES DE ALIMENTACION   **USADO
        this.router.post('/timbres-alimentacion/:desde/:hasta', [verificarToken_1.TokenValidation], alimentacionControlador_1.default.ReporteTimbresAlimentacion);
    }
}
const ALIMENTACION_RUTAS = new AlimentacionRutas();
exports.default = ALIMENTACION_RUTAS.router;
