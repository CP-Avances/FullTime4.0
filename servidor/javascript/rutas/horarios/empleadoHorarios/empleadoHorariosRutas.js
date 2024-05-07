"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empleadoHorariosControlador_1 = __importDefault(require("../../../controlador/horarios/empleadoHorarios/empleadoHorariosControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class EmpleadoHorariosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR HORARIOS EXISTENTES DEL USUARIO EN FECHAS DETERMINADAS  --**VERIFICADO
        this.router.post('/horarios-existentes/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarHorariosExistentes);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN EL MISMO DIA
        this.router.post('/horario-horas-mismo-dia', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerHorarioHorasMD);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN DIAS DIFERENTES
        this.router.post('/horario-horas-dias-diferentes', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerHorarioHorasDD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN EL MISMO DIA
        this.router.post('/horario-comida-horas-mismo-dia', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerComidaHorarioHorasMD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN DIAS DIFERENTES
        this.router.post('/horario-comida-horas-dias-diferentes', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerComidaHorarioHorasDD);
        // METODO PARA VERIFICAR SI EXISTE PLANIFICACION   --**VERIFICADO
        this.router.post('/validarFechas/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarFechasHorario);
        // Verificar datos de la plantilla del horario de un empleado
        this.router.post('/verificarPlantilla/upload', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.VerificarPlantilla_HorarioEmpleado);
        this.router.post('/plan_general/upload/:id/:codigo', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.CrearPlanificacionGeneral);
    }
}
const EMPLEADO_HORARIOS_RUTAS = new EmpleadoHorariosRutas();
exports.default = EMPLEADO_HORARIOS_RUTAS.router;
