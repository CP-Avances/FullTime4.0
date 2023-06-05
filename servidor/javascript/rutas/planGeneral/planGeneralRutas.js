"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const planGeneralControlador_1 = __importDefault(require("../../controlador/planGeneral/planGeneralControlador"));
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA REGISTRAR PLAN GENERAL
        this.router.post('/', verificarToken_1.TokenValidation, planGeneralControlador_1.default.CrearPlanificacion);
        // METOOD PARA BUSCAR ID POR FECHAS PLAN GENERAL
        this.router.post('/buscar_fechas', verificarToken_1.TokenValidation, planGeneralControlador_1.default.BuscarFechas);
        // METODO PARA ELIMINAR REGISTROS
        this.router.post('/eliminar', verificarToken_1.TokenValidation, planGeneralControlador_1.default.EliminarRegistros);
        // METODO PARA BUSCAR HORARIO DE UN USUARIO POR FECHAS
        this.router.post('/horario-general-fechas', verificarToken_1.TokenValidation, planGeneralControlador_1.default.BuscarHorarioFechas);
        this.router.post('/buscar_fecha/plan', verificarToken_1.TokenValidation, planGeneralControlador_1.default.BuscarFecha);
    }
}
const PLAN_GENERAL_RUTAS = new DepartamentoRutas();
exports.default = PLAN_GENERAL_RUTAS.router;
