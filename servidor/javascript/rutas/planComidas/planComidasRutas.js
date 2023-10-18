"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const planComidasControlador_1 = __importDefault(require("../../controlador/planComidas/planComidasControlador"));
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/infoComida/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaIdEmpleado);
        this.router.get('/infoComida/estado/aprobado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaAprobada);
        this.router.get('/infoComida/estado/negado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaNull);
        this.router.get('/infoComida/estado/expirada', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaExpirada);
        /** CONOCER JEFES DE UN DEPARTAMENTO */
        this.router.get('/enviar/notificacion/:id_departamento', verificarToken_1.TokenValidation, planComidasControlador_1.default.BuscarJefes);
        /** PLANIFICACIÓN DE ALIMENTACIÓN */
        this.router.get('/', verificarToken_1.TokenValidation, planComidasControlador_1.default.ListarPlanComidas);
        this.router.post('/', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearPlanComidas);
        this.router.get('/fin_registro', verificarToken_1.TokenValidation, planComidasControlador_1.default.ObtenerUltimaPlanificacion);
        this.router.put('/', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarPlanComidas);
        this.router.post('/duplicidad/plan', verificarToken_1.TokenValidation, planComidasControlador_1.default.BuscarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.BuscarSolEmpleadoFechasActualizar);
        this.router.post('/duplicidad/actualizar/plan', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/actualizar/sol', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarSolComidaEmpleadoFechas);
        this.router.post('/empleado/plan/consumido', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarPlanComidaEmpleadoConsumido);
        // Registrar en tabla tipo_comida
        this.router.post('/tipo_comida', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearTipoComidas);
        this.router.get('/tipo_comida', verificarToken_1.TokenValidation, planComidasControlador_1.default.ListarTipoComidas);
        this.router.get('/tipo_comida/ultimo', verificarToken_1.TokenValidation, planComidasControlador_1.default.VerUltimoTipoComidas);
        /** ************************************************************************************************ **
         ** **                   METODOS DE MANEJO DE SOLICTUDES DE ALIMENTACIÓN                          ** **
         ** ************************************************************************************************ **/
        // CREAR SOLICITUD DE ALIMENTACION
        this.router.post('/solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearSolicitaComida);
        // EDITAR SOLIICTUD DE ALIMENTACION
        this.router.put('/actualizar-solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarSolicitaComida);
        // ELIMINAR REGISTRO DE SOLICITUD DE ALIMENTACION
        this.router.delete('/eliminar/sol-comida/:id', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarSolicitudComida);
        // ACTUALIZAR APROBACION DE SOLICITUD DE COMIDA
        this.router.put('/solicitud-comida/estado', verificarToken_1.TokenValidation, planComidasControlador_1.default.AprobarSolicitaComida);
        /** ************************************************************************************************ **
         ** **                 METODO DE MANEJO DE PLANIFICACION DE ALIMENTACION                          ** **
         ** ************************************************************************************************ **/
        // METODO DE CREACION DE PLANIFICACION DE ALIMENTACION
        this.router.post('/empleado/solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearComidaAprobada);
        // METODO DE ELIMINACION DE ALIMENTACION APROBADA
        this.router.delete('/eliminar/plan-solicitud/:id/:fecha/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarComidaAprobada);
        // ELIMINAR PLANIFICACION DE ALIMENTACION
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarRegistros);
        // ELIMINAR PLANIFICACION DE UN USUARIO
        this.router.delete('/eliminar/plan-comida/:id/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarPlanComidaEmpleado);
        // REGISTRO DE LA PLANIFICACIÓN DE ALIMENTACIÓN AL EMPLEADO 
        this.router.post('/empleado/plan', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearPlanEmpleado);
        // BUSQUEDA DE DATOS DE USUARIO POR ID DE PLANIFICACION
        this.router.get('/comida-empleado/plan/:id', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarPlanComidaIdPlan);
        // BUSQUEDA DE PLANIFICACIONES DE ALIMENTACION POR ID DE USUARIO
        this.router.get('/infoComida/plan/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarPlanComidaIdEmpleado);
        /** ************************************************************************************************ **
         ** *                     NOTIFICACIONES DE SERVICIOS DE ALIMENTACIÓN                             ** **
         ** ************************************************************************************************ **/
        // METODO DE ENVIO DE NOTIFICACIONES DE SOLICITUDES
        this.router.post('/send/planifica/', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarNotificacionComidas);
        /** ************************************************************************************************ **
         ** *                     ENVIO DE CORREO DE SERVICIOS DE ALIMENTACION                            ** **
         ** ************************************************************************************************ **/
        // METODO DE ENVIO DE CORREO DE SOLICITUD DE SERVICIO DE ALIMENTACION
        this.router.post('/mail-noti/', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoComidas);
        // METODO DE ENVIO DE CORREO ELECTRONICO DE PLANIFICACION DE SERVICIO DE ALIMENTACION APP WEB
        this.router.post('/mail-plan-comida/', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoPlanComidas);
        // METODO DE ENVIO DE CORREO ELECTRONICO DE SOLICITUD DE SERVICIO DE ALIMENTACION APP MOVIL
        this.router.post('/mail-noti-solicitud-comida-movil/:id_empresa', planComidasControlador_1.default.EnviarCorreoComidasMovil);
    }
}
const PLAN_COMIDAS_RUTAS = new DepartamentoRutas();
exports.default = PLAN_COMIDAS_RUTAS.router;
