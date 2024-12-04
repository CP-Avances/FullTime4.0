import { Router } from 'express';
import NOTIFICACION_TIEMPO_REAL_CONTROLADOR from '../../controlador/notificaciones/notificacionesControlador';
import { TokenValidation } from '../../libs/verificarToken'

class NotificacionTiempoRealRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CONTROLAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO
        this.router.get('/config/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ObtenerConfigEmpleado);
        this.router.post('/config-multiple/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ObtenerConfigMultipleEmpleado);

        // RUTA PARA CREAR NOTIFICACION
        this.router.post('/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.CrearNotificacion);

        this.router.get('/all-receives/:id_receive', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ListaNotificacionesRecibidas);

        this.router.put('/vista/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ActualizarVista);
        this.router.put('/eliminar-multiples/avisos', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EliminarMultiplesNotificaciones);

        // NOTIFICACIONES RECIBIDAS POR UN USUARIO
        this.router.get('/receives/:id_receive', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ListarNotificacionUsuario);

        // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES   **USADO
        this.router.post('/config/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.CrearConfiguracion);
        this.router.post('/config-multiple-crear/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.CrearConfiguracionMultiple);

        // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
        this.router.put('/config/noti-put/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ActualizarConfigEmpleado);
        this.router.put('/config/noti-put-multiple/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ActualizarConfigEmpleadoMultiple);

        // RUTA DE ACCESO A DATOS DE COMUNICADOS APLICACION MÓVIL
        this.router.post('/mail-comunicado-movil/:id_empresa/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarCorreoComunicadoMovil);
        this.router.post('/noti-comunicado-movil/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneral);

        this.router.post('/noti-comunicado-multiplador-movil/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneralMultiple);

        // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
        this.router.get('/one/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ObtenerUnaNotificacion);


        /** *************************************************************************************** **
         ** **                    MANEJO DE DATOS DE CORREOS MULTIPLE                                ** ** 
         ** *************************************************************************************** **/
        // METODO PARA ENVIAR CORREO DE APROBACION MULTIPLE
        this.router.post('/mail-multiple/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarCorreoSolicitudes);

        // METODO PARA ENVIAR CORREO DE APROBACION MULTIPLE DESDE LA APLICACION  MÓVIL
        this.router.post('/mail-multiple-movil/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarCorreoSolicitudes);

        /** *************************************************************************************** **
         ** **                    MANEJO DE DATOS DE COMUNICADOS                                 ** ** 
         ** *************************************************************************************** **/

        // METODO PARA ENVIAR CORREO DE COMUNICADOS    **USADO
        this.router.post('/mail-comunicado/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarCorreoComunicado);
        // METODO DE ENVIO DE NOTIFICACIONES DE COMUNICADOS    **USADO
        this.router.post('/noti-comunicado/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneral);
        this.router.post('/noti-comunicado-multiplador/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneralMultiple);

        //------------------------------------------ METODOS APP MOVIL -----------------------------------------------------------------------
        this.router.get('/info-empl-recieve', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.getInfoEmpleadoByCodigo);
        this.router.get('/all-noti', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.getNotificacion);
        this.router.get('/noti-tim/all-noti', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.getNotificacionTimbres);

    }
}

const NOTIFICACION_TIEMPO_REAL_RUTAS = new NotificacionTiempoRealRutas();

export default NOTIFICACION_TIEMPO_REAL_RUTAS.router;