"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const periodoVacacionControlador_1 = __importDefault(require("../../../controlador/modulos/vacaciones/periodoVacacionControlador"));
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR PERIODO DE VACACIONES   **USADO
        this.router.get('/buscar/:id_empleado', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.EncontrarIdPerVacaciones);
        // METODO PARA CONSULTAR DATOS DE PERIODO DE VACACION    **USADO
        this.router.get('/infoPeriodo/:id_empleado', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.EncontrarPerVacaciones);
        this.router.post('/', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.CrearPerVacaciones);
        this.router.put('/', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.ActualizarPeriodo);
    }
}
const PERIODO_VACACION__RUTAS = new DepartamentoRutas();
exports.default = PERIODO_VACACION__RUTAS.router;
