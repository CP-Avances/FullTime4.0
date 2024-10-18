"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarHoraExtra_1 = require("../../../libs/Modulos/verificarHoraExtra");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const planHoraExtraControlador_1 = __importDefault(require("../../../controlador/modulos/horas-extras/planHoraExtraControlador"));
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtra);
        this.router.get('/justificar', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtraObserva);
        this.router.get('/autorizacion', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtraAutorizada);
        this.router.put('/estado/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ActualizarEstado);
        this.router.get('/datosAutorizacion/:id_plan_extra', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ObtenerDatosAutorizacion);
        // ACTUALIZACION DE TIEMPO AUTORIZADO 
        this.router.put('/tiempo-autorizado/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.TiempoAutorizado);
        /** ******************************************************************************************************* **
         ** **                               PLANIFICACION DE HORAS EXTRAS                                       ** **
         ** ******************************************************************************************************* **/
        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS
        this.router.post('/', [verificarToken_1.TokenValidation], planHoraExtraControlador_1.default.CrearPlanHoraExtra);
        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS POR USUARIO
        this.router.post('/hora_extra_empleado', [verificarToken_1.TokenValidation], planHoraExtraControlador_1.default.CrearPlanHoraExtraEmpleado);
        // BUSQUEDA DE PLANIFICACIONES DE HORAS EXTRAS
        this.router.get('/planificaciones', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanificacion);
        // BUSQUEDA DE DATOS DE PLANIFICACION POR ID DE PLANIFICACION
        this.router.get('/plan_empleado/:id_plan_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanEmpleados);
        // ELIMINAR PLANIFICACION DE ALIMENTACION
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, planHoraExtraControlador_1.default.EliminarRegistros);
        // ELIMINAR PLANIFICACION DE UN USUARIO    **USADO
        this.router.delete('/eliminar/plan-hora/:id/:id_empleado', verificarToken_1.TokenValidation, planHoraExtraControlador_1.default.EliminarPlanEmpleado);
        // BUSQUEDA DE DATOS DE PLANIFICACION POR ID DE USUARIO   **USADO
        this.router.get('/listar-plan/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.BuscarPlanUsuario);
        /** ******************************************************************************************** **
         ** *             ENVIO DE CORREO ELECTRONICO DE PLANIFICACIONES DE HORAS EXTRAS               * **
         ** ******************************************************************************************** **/
        // CREACION DE PLANIFICACION DE HORAS EXTRAS   **USADO
        this.router.post('/send/correo-planifica/', [verificarToken_1.TokenValidation], planHoraExtraControlador_1.default.EnviarCorreoPlanificacion);
        /** ******************************************************************************************** **
         ** *                   NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS                       ** **
         ** ******************************************************************************************** **/
        // CREACION DE PLANIFICACION DE HORAS EXTRAS    **USADO
        this.router.post('/send/noti-planifica', verificarToken_1.TokenValidation, planHoraExtraControlador_1.default.EnviarNotiPlanHE);
    }
}
const PLAN_HORA_EXTRA_RUTAS = new DepartamentoRutas();
exports.default = PLAN_HORA_EXTRA_RUTAS.router;
