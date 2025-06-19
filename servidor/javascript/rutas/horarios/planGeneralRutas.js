"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const planGeneralControlador_1 = __importDefault(require("../../controlador/horarios/planGeneralControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA REGISTRAR PLAN GENERAL  **USADO
        this.router.post('/', verificarToken_1.TokenValidation, planGeneralControlador_1.default.CrearPlanificacion);
        // METODO PARA CREAR PLAN GENERAL POR LOTES  **USADO
        this.router.post('/cargar-planificacion', verificarToken_1.TokenValidation, planGeneralControlador_1.default.CrearPlanificacionPorLotes);
        // METOOD PARA BUSCAR ID POR FECHAS PLAN GENERAL  **USADO
        this.router.post('/buscar_fechas', verificarToken_1.TokenValidation, planGeneralControlador_1.default.BuscarFechas);
        // METOOD PARA BUSCAR ID POR FECHAS PLAN GENERAL MULTIPLE    **USADO
        this.router.post('/buscar_fechas_multiple', verificarToken_1.TokenValidation, planGeneralControlador_1.default.BuscarFechasMultiples);
        // METODO PARA ELIMINAR REGISTROS  **USADO
        this.router.post('/eliminar', verificarToken_1.TokenValidation, planGeneralControlador_1.default.EliminarRegistros);
        // METODO PARA ELIMINAR REGISTROS MULTIPLES  **USADO
        this.router.post('/eliminar-multiples', verificarToken_1.TokenValidation, planGeneralControlador_1.default.EliminarRegistrosMultiples);
        // METODO PARA LISTAR PLANIFICACION DE USUARIOS  **USADO
        this.router.post('/horario-general-planificacion', verificarToken_1.TokenValidation, planGeneralControlador_1.default.ListarPlanificacionHoraria);
        // METODO PARA LISTAR DETALLE DE HORARIOS DE LOS USUARIOS    **USADO
        this.router.post('/horario-general-detalle', verificarToken_1.TokenValidation, planGeneralControlador_1.default.ListarDetalleHorarios);
        // METODO PARA LISTAR SOLO HORARIOS DE USUARIOS  **USADO
        this.router.post('/horario-solo-planificacion/lista', verificarToken_1.TokenValidation, planGeneralControlador_1.default.ListarHorariosUsuario);
        // METODO PARA BUSCAR ASISTENCIA   **USADO
        this.router.post('/buscar-asistencia', verificarToken_1.TokenValidation, planGeneralControlador_1.default.BuscarAsistencia);
        // METODO PARA ACTUALIZAR ASISTENCIA MANUAL   **USADO
        this.router.post('/actualizar-asistencia/manual', verificarToken_1.TokenValidation, planGeneralControlador_1.default.ActualizarManual);
        // METODO PARA BUSCAR HORARIO DE UN USUARIO POR FECHAS
        this.router.post('/horario-general-fechas', verificarToken_1.TokenValidation, planGeneralControlador_1.default.BuscarHorarioFechas);
    }
}
const PLAN_GENERAL_RUTAS = new DepartamentoRutas();
exports.default = PLAN_GENERAL_RUTAS.router;
