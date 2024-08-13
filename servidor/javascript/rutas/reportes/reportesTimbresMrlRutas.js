"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const reportesTimbresMrlControlador_1 = __importDefault(require("../../controlador/reportes/reportesTimbresMrlControlador"));
class ReportesTimbresMrlRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REPORTES DE TIMBRES MRL    **USADO
        this.router.post('/timbres/:desde/:hasta', verificarToken_1.TokenValidation, reportesTimbresMrlControlador_1.default.ReporteTimbresMrl);
    }
}
const REPORTES_TIMBRES_MRL_RUTAS = new ReportesTimbresMrlRutas();
exports.default = REPORTES_TIMBRES_MRL_RUTAS.router;
