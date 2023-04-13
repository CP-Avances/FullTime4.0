"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const detallePlanHorarioControlador_1 = __importDefault(require("../../../controlador/horarios/detallePlanHorario/detallePlanHorarioControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class DetallePlanHorarioRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, detallePlanHorarioControlador_1.default.ListarDetallePlanHorario);
        this.router.get('/infoPlan/:id_plan_horario', verificarToken_1.TokenValidation, detallePlanHorarioControlador_1.default.EncontrarPlanHoraDetallesPorIdPlanHorario);
        this.router.post('/', verificarToken_1.TokenValidation, detallePlanHorarioControlador_1.default.CrearDetallePlanHorario);
        this.router.put('/', verificarToken_1.TokenValidation, detallePlanHorarioControlador_1.default.ActualizarDetallePlanHorario);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, detallePlanHorarioControlador_1.default.EliminarRegistros);
        this.router.post('/verificarRegistro', verificarToken_1.TokenValidation, detallePlanHorarioControlador_1.default.ObtenerRegistrosFecha);
        this.router.post('/verificarDuplicado/:id', verificarToken_1.TokenValidation, detallePlanHorarioControlador_1.default.VerificarDuplicidadEdicion);
        // Verificar datos de la plantilla de detalles del plan horario
        this.router.post('/verificarDatos/:id_plan_horario/upload', verificarToken_1.TokenValidation, multipartMiddleware, detallePlanHorarioControlador_1.default.VerificarDatos);
        this.router.post('/verificarPlantilla/upload', verificarToken_1.TokenValidation, multipartMiddleware, detallePlanHorarioControlador_1.default.VerificarPlantilla);
        this.router.post('/:id_plan_horario/upload', verificarToken_1.TokenValidation, multipartMiddleware, detallePlanHorarioControlador_1.default.CrearDetallePlanificacionPlantilla);
        this.router.post('/plan_general/:id/:codigo/upload', verificarToken_1.TokenValidation, multipartMiddleware, detallePlanHorarioControlador_1.default.CrearPlanificacionGeneral);
    }
}
const DETALLE_PLAN_HORARIO_RUTAS = new DetallePlanHorarioRutas();
exports.default = DETALLE_PLAN_HORARIO_RUTAS.router;
