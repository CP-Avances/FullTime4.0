"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reporteNotificacionControlador_1 = __importDefault(require("../../controlador/reportes/reporteNotificacionControlador"));
class NotificacionesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/permisos_enviados/:envia', reporteNotificacionControlador_1.default.ListarPermisosEnviados);
        this.router.get('/permisos_recibidos/:recibe', reporteNotificacionControlador_1.default.ListarPermisosRecibidos);
        this.router.get('/solicita_extra_enviados/:envia', reporteNotificacionControlador_1.default.ListarSolicitudHoraExtraEnviadas);
        this.router.get('/solicita_extra_recibidos/:recibe', reporteNotificacionControlador_1.default.ListarSolicitudHoraExtraRecibidas);
        this.router.get('/vacaciones_enviados/:envia', reporteNotificacionControlador_1.default.ListarVacacionesEnviadas);
        this.router.get('/vacaciones_recibidos/:recibe', reporteNotificacionControlador_1.default.ListarVacacionesRecibidas);
        this.router.get('/planificaciones_enviadas/:envia', reporteNotificacionControlador_1.default.ListarPlanificaComidaEnviadas);
        this.router.get('/planificaciones_eliminadas/:envia', reporteNotificacionControlador_1.default.ListarPlanificacionesEliminadas);
        // NOTIIFCACIONES LISTA DE USUARIO
        this.router.get('/usuario_permisos_enviados/:envia', reporteNotificacionControlador_1.default.ListarUsuariosPermisosEnviados);
        this.router.get('/usuario_permisos_recibidos/:recibe', reporteNotificacionControlador_1.default.ListarUsuariosPermisosRecibidos);
        this.router.get('/usuario_vacaciones_enviados/:envia', reporteNotificacionControlador_1.default.ListarUsuariosVacacionesEnviadas);
        this.router.get('/usuario_vacaciones_recibidos/:recibe', reporteNotificacionControlador_1.default.ListarUsuariosVacacionesRecibidas);
        this.router.get('/usuario_extras_enviados/:envia', reporteNotificacionControlador_1.default.ListarUsuariosExtrasEnviados);
        this.router.get('/usuario_extras_recibidos/:recibe', reporteNotificacionControlador_1.default.ListarUsuariosExtrasRecibidos);
        this.router.get('/usuario_comidas_enviados/:envia', reporteNotificacionControlador_1.default.ListarUsuariosComidasEnviadas);
        this.router.get('/usuario_comidas_recibidos/:recibe', reporteNotificacionControlador_1.default.ListarUsuariosComidasRecibidas);
        // NOTIFICACIONES TOTALES POR USUARIO
        this.router.get('/usuario_permisos_enviados_todas/:envia/:id_empleado', reporteNotificacionControlador_1.default.ListarPermisosEnviados_Usuario);
        this.router.get('/usuario_permisos_recibidos_todas/:recibe/:id_empleado', reporteNotificacionControlador_1.default.ListarPermisosRecibidos_Usuario);
        this.router.get('/usuario_vacaciones_enviados_todas/:envia/:id_empleado', reporteNotificacionControlador_1.default.ListarVacacionesEnviadas_Usuario);
        this.router.get('/usuario_vacaciones_recibidos_todas/:recibe/:id_empleado', reporteNotificacionControlador_1.default.ListarVacacionesRecibidas_Usuario);
        this.router.get('/usuario_extras_enviados_todas/:envia/:id_empleado', reporteNotificacionControlador_1.default.ListarSolicitudHoraExtraEnviadas_Usuario);
        this.router.get('/usuario_comidas_enviados_todas/:envia/:id_empleado', reporteNotificacionControlador_1.default.ListarPlanificaComidaEnviadas_Usuario);
        //  this.router.get('/usuario_comidas_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosComidasRecibidas);
        // NOTIFICACIONES TOTALES POR USUARIO
        this.router.get('/usuario_permisos_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', reporteNotificacionControlador_1.default.ListarPermisosEnviados_UsuarioFecha);
        this.router.get('/usuario_permisos_recibidos_fecha/:recibe/:id_empleado/:fec_inicio/:fec_final', reporteNotificacionControlador_1.default.ListarPermisosRecibidos_UsuarioFecha);
        this.router.get('/usuario_vacaciones_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', reporteNotificacionControlador_1.default.ListarVacacionesEnviadas_UsuarioFecha);
        this.router.get('/usuario_vacaciones_recibidos_fecha/:recibe/:id_empleado/:fec_inicio/:fec_final', reporteNotificacionControlador_1.default.ListarVacacionesRecibidas_UsuarioFecha);
        this.router.get('/usuario_extras_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', reporteNotificacionControlador_1.default.ListarSolicitudHoraExtraEnviadas_UsuarioFecha);
        this.router.get('/usuario_comidas_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', reporteNotificacionControlador_1.default.ListarPlanificaComidaEnviadas_UsuarioFecha);
        //  this.router.get('/usuario_comidas_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosComidasRecibidas);
        this.router.get('/noti-tim/all-noti', reporteNotificacionControlador_1.default.getNotificacionTimbres);
    }
}
const NOTIFICACION_RUTAS = new NotificacionesRutas();
exports.default = NOTIFICACION_RUTAS.router;
