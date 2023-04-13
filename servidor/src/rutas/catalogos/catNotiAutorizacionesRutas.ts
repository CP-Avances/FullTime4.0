import { Router } from 'express';
import NOTIFICACIONES_AUTORIZACIONES_CONTROLADOR from '../../controlador/catalogos/catNotiAutorizacionesControlador';
import { TokenValidation } from '../../libs/verificarToken';

class NotificacionesAutorizacionesRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, NOTIFICACIONES_AUTORIZACIONES_CONTROLADOR.ListarNotiAutorizaciones);
        this.router.get('/lista/:id_notificacion', TokenValidation, NOTIFICACIONES_AUTORIZACIONES_CONTROLADOR.ListarPorNotificacion);
        this.router.get('/:id', TokenValidation, NOTIFICACIONES_AUTORIZACIONES_CONTROLADOR.ObtenerUnaNotiAutorizacion);
        this.router.post('/', TokenValidation, NOTIFICACIONES_AUTORIZACIONES_CONTROLADOR.CrearNotiAutorizacion);
    }
}

const NOTIFICACIONES_AUTORIZACIONES_RUTA = new NotificacionesAutorizacionesRutas();

export default NOTIFICACIONES_AUTORIZACIONES_RUTA.router;