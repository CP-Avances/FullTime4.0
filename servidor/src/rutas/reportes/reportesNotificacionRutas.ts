import { Router } from 'express';

import NOTIFICACIONES_CONTROLADOR from '../../controlador/reportes/reporteNotificacionControlador';

class NotificacionesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/permisos_enviados/:envia', NOTIFICACIONES_CONTROLADOR.ListarPermisosEnviados);
        this.router.get('/permisos_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarPermisosRecibidos);
        this.router.get('/solicita_extra_enviados/:envia', NOTIFICACIONES_CONTROLADOR.ListarSolicitudHoraExtraEnviadas);
        this.router.get('/solicita_extra_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarSolicitudHoraExtraRecibidas);
        this.router.get('/vacaciones_enviados/:envia', NOTIFICACIONES_CONTROLADOR.ListarVacacionesEnviadas);
        this.router.get('/vacaciones_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarVacacionesRecibidas);
        this.router.get('/planificaciones_enviadas/:envia', NOTIFICACIONES_CONTROLADOR.ListarPlanificaComidaEnviadas);
        this.router.get('/planificaciones_eliminadas/:envia', NOTIFICACIONES_CONTROLADOR.ListarPlanificacionesEliminadas);
        // NOTIIFCACIONES LISTA DE USUARIO
        this.router.get('/usuario_permisos_enviados/:envia', NOTIFICACIONES_CONTROLADOR.ListarUsuariosPermisosEnviados);
        this.router.get('/usuario_permisos_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosPermisosRecibidos);

        this.router.get('/usuario_vacaciones_enviados/:envia', NOTIFICACIONES_CONTROLADOR.ListarUsuariosVacacionesEnviadas);
        this.router.get('/usuario_vacaciones_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosVacacionesRecibidas);

        this.router.get('/usuario_extras_enviados/:envia', NOTIFICACIONES_CONTROLADOR.ListarUsuariosExtrasEnviados);
        this.router.get('/usuario_extras_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosExtrasRecibidos);

        this.router.get('/usuario_comidas_enviados/:envia', NOTIFICACIONES_CONTROLADOR.ListarUsuariosComidasEnviadas);
        this.router.get('/usuario_comidas_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosComidasRecibidas);

        // NOTIFICACIONES TOTALES POR USUARIO
        this.router.get('/usuario_permisos_enviados_todas/:envia/:id_empleado', NOTIFICACIONES_CONTROLADOR.ListarPermisosEnviados_Usuario);
        this.router.get('/usuario_permisos_recibidos_todas/:recibe/:id_empleado', NOTIFICACIONES_CONTROLADOR.ListarPermisosRecibidos_Usuario);

        this.router.get('/usuario_vacaciones_enviados_todas/:envia/:id_empleado', NOTIFICACIONES_CONTROLADOR.ListarVacacionesEnviadas_Usuario);
        this.router.get('/usuario_vacaciones_recibidos_todas/:recibe/:id_empleado', NOTIFICACIONES_CONTROLADOR.ListarVacacionesRecibidas_Usuario);

        this.router.get('/usuario_extras_enviados_todas/:envia/:id_empleado', NOTIFICACIONES_CONTROLADOR.ListarSolicitudHoraExtraEnviadas_Usuario);
        this.router.get('/usuario_comidas_enviados_todas/:envia/:id_empleado', NOTIFICACIONES_CONTROLADOR.ListarPlanificaComidaEnviadas_Usuario);
        //  this.router.get('/usuario_comidas_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosComidasRecibidas);

        // NOTIFICACIONES TOTALES POR USUARIO
        this.router.get('/usuario_permisos_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', NOTIFICACIONES_CONTROLADOR.ListarPermisosEnviados_UsuarioFecha);
        this.router.get('/usuario_permisos_recibidos_fecha/:recibe/:id_empleado/:fec_inicio/:fec_final', NOTIFICACIONES_CONTROLADOR.ListarPermisosRecibidos_UsuarioFecha);

        this.router.get('/usuario_vacaciones_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', NOTIFICACIONES_CONTROLADOR.ListarVacacionesEnviadas_UsuarioFecha);
        this.router.get('/usuario_vacaciones_recibidos_fecha/:recibe/:id_empleado/:fec_inicio/:fec_final', NOTIFICACIONES_CONTROLADOR.ListarVacacionesRecibidas_UsuarioFecha);

        this.router.get('/usuario_extras_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', NOTIFICACIONES_CONTROLADOR.ListarSolicitudHoraExtraEnviadas_UsuarioFecha);

        this.router.get('/usuario_comidas_enviados_fecha/:envia/:id_empleado/:fec_inicio/:fec_final', NOTIFICACIONES_CONTROLADOR.ListarPlanificaComidaEnviadas_UsuarioFecha);
        //  this.router.get('/usuario_comidas_recibidos/:recibe', NOTIFICACIONES_CONTROLADOR.ListarUsuariosComidasRecibidas);

    }
}

const NOTIFICACION_RUTAS = new NotificacionesRutas();

export default NOTIFICACION_RUTAS.router;