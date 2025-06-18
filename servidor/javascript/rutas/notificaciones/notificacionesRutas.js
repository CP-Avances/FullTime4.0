"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notificacionesControlador_1 = __importDefault(require("../../controlador/notificaciones/notificacionesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class NotificacionTiempoRealRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** ************************************************************************************ **
         ** **                        METODOS PARA CONFIGURAR_ALERTAS                         ** **
         ** ************************************************************************************ **/
        // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES   **USADO
        this.router.post('/config/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.CrearConfiguracion);
        // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
        this.router.post('/config-multiple-crear/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.CrearConfiguracionMultiple);
        // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
        this.router.put('/config/noti-put/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ActualizarConfigEmpleado);
        // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
        this.router.put('/config/noti-put-multiple/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ActualizarConfigEmpleadoMultiple);
        // METODO PARA CONTROLAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO
        this.router.get('/config/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ObtenerConfigEmpleado);
        // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO
        this.router.post('/config-multiple/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ObtenerConfigMultipleEmpleado);
        /** ************************************************************************************ **
         ** **                 METODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** **
         ** ************************************************************************************ **/
        // METODO PARA ENVIAR CORREO DE COMUNICADOS    **USADO
        this.router.post('/mail-comunicado/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.EnviarCorreoComunicado);
        // METODO PARA ENVIO DE NOTIFICACION DE COMUNICADOS   **USADO
        this.router.post('/noti-comunicado-multiple/', notificacionesControlador_1.default.EnviarNotificacionGeneralMultiple);
        /** ********************************************************************************************************** **
         ** **          M E T O D O S    U S A D O S   E N    L A    A P L I C A C I O N    M O V I L               ** **
         ** ********************************************************************************************************** **/
        this.router.get('/info-empl-recieve', verificarToken_1.TokenValidation, notificacionesControlador_1.default.getInfoEmpleadoByCodigo);
        this.router.get('/all-noti', verificarToken_1.TokenValidation, notificacionesControlador_1.default.getNotificacion);
        this.router.get('/noti-tim/all-noti', verificarToken_1.TokenValidation, notificacionesControlador_1.default.getNotificacionTimbres);
        // ----------------------------- VERIFICAR SU USO EN LA APLICACION MOVIL
        // RUTA DE ACCESO A DATOS DE COMUNICADOS APLICACION MÓVIL
        this.router.post('/noti-comunicado-movil/', notificacionesControlador_1.default.EnviarNotificacionGeneral);
        this.router.post('/noti-comunicado-multiplador-movil/', notificacionesControlador_1.default.EnviarNotificacionGeneralMultiple);
        // METODO PARA ENVIAR CORREO DE APROBACION MULTIPLE DESDE LA APLICACION  MÓVIL
        this.router.post('/mail-multiple-movil/', notificacionesControlador_1.default.EnviarCorreoSolicitudes);
        // METODO DE ENVIO DE NOTIFICACIONES DE COMUNICADOS    **USADO
        this.router.post('/noti-comunicado/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.EnviarNotificacionGeneral);
        // NOTIFICACIONES RECIBIDAS POR UN USUARIO
        this.router.get('/receives/:id_receive', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ListarNotificacionUsuario);
        // RUTA PARA CREAR NOTIFICACION
        this.router.post('/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.CrearNotificacion);
        // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
        this.router.get('/one/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ObtenerUnaNotificacion);
        this.router.get('/all-receives/:id_receive', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ListaNotificacionesRecibidas);
        this.router.put('/vista/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ActualizarVista);
        this.router.put('/eliminar-multiples/avisos', verificarToken_1.TokenValidation, notificacionesControlador_1.default.EliminarMultiplesNotificaciones);
        // METODO PARA ENVIAR CORREO DE APROBACION MULTIPLE
        this.router.post('/mail-multiple/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.EnviarCorreoSolicitudes);
    }
}
const NOTIFICACION_TIEMPO_REAL_RUTAS = new NotificacionTiempoRealRutas();
exports.default = NOTIFICACION_TIEMPO_REAL_RUTAS.router;
