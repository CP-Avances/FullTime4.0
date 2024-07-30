"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const vacacionesControlador_1 = __importDefault(require("../../controlador/vacaciones/vacacionesControlador"));
class VacacionesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarVacaciones);
        this.router.get('/estado-solicitud', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarVacacionesAutorizadas);
        this.router.get('/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.VacacionesIdPeriodo);
        this.router.post('/fechasFeriado', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerFechasFeriado);
        this.router.get('/datosSolicitud/:id_emple_vacacion', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerSolicitudVacaciones);
        this.router.get('/datosAutorizacion/:id_vacaciones', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerAutorizacionVacaciones);
        this.router.get('/lista-vacacionesfechas/fechas/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.getlistaVacacionesByFechasyCodigo);
        /** ************************************************************************************************* **
         ** **                          METODOS PARA MANEJO DE VACACIONES                                  ** **
         ** ************************************************************************************************* **/
        // CREAR REGISTRO DE VACACIONES
        this.router.post('/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.CrearVacaciones);
        // EDITAR REGISTRO DE VACACIONES
        this.router.put('/:id/vacacion-solicitada', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EditarVacaciones);
        // BUSQUEDA DE VACACIONES MEDIANTE ID
        this.router.get('/listar/vacacion/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarVacacionId);
        // ELIMINAR SOLICITUD DE VACACIONES
        this.router.delete('/eliminar/:id_vacacion', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EliminarVacaciones);
        // EDITAR ESTADO DE VACACIONES
        this.router.put('/:id/estado', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ActualizarEstado);
        // BUSCAR DATOS DE VACACIONES POR ID DE VACACION
        this.router.get('/one/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarUnaVacacion);
        /** ************************************************************************************************* **
         ** **                        METODO DE ENVIO DE NOTIFICACIONES                                    ** **
         ** ************************************************************************************************* **/
        // ENVIO DE CORREO DE VACACIONES DESDE APLICACIONES WEB
        this.router.post('/mail-noti/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EnviarCorreoVacacion);
        // ENVIO DE CORREO DE VACACIONES DESDE APLICACION MOVIL
        this.router.post('/mail-noti-vacacion-movil/:id_empresa', vacacionesControlador_1.default.EnviarCorreoVacacionesMovil);
    }
}
const VACACIONES_RUTAS = new VacacionesRutas();
exports.default = VACACIONES_RUTAS.router;
