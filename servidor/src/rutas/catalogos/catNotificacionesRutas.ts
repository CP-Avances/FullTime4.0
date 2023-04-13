import { Router } from 'express';
import NOTIFICACIONES_CONTROLADOR from '../../controlador/catalogos/catNotificacionesControlador';
import { TokenValidation } from '../../libs/verificarToken';

class NotificacionesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, NOTIFICACIONES_CONTROLADOR.ListarNotificaciones);
        this.router.get('/depa/:id_depa', TokenValidation, NOTIFICACIONES_CONTROLADOR.ListarNotiByDepartamento);
        this.router.get('/:id', TokenValidation, NOTIFICACIONES_CONTROLADOR.ObtenerUnaNotificacion);
        this.router.get('/listar/final', TokenValidation, NOTIFICACIONES_CONTROLADOR.NotificacionLista);
        this.router.post('/', TokenValidation, NOTIFICACIONES_CONTROLADOR.CrearNotificacion);
        this.router.get('/notificacionPermiso/:id_tipo_permiso', TokenValidation, NOTIFICACIONES_CONTROLADOR.ObtenerNotificacionPermiso);
    }
}

const NOTIFICACIONES_RUTAS = new NotificacionesRutas();

export default NOTIFICACIONES_RUTAS.router;
