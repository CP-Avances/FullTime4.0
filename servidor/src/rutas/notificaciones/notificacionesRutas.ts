import NOTIFICACION_TIEMPO_REAL_CONTROLADOR from '../../controlador/notificaciones/notificacionesControlador';
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';

class NotificacionTiempoRealRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {

        /** ************************************************************************************ **
         ** **                        METODOS PARA CONFIGURAR_ALERTAS                         ** **
         ** ************************************************************************************ **/

        // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES   **USADO
        this.router.post('/config/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.CrearConfiguracion);
        // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
        this.router.post('/config-multiple-crear/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.CrearConfiguracionMultiple);
        // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
        this.router.put('/config/noti-put/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ActualizarConfigEmpleado);
        // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
        this.router.put('/config/noti-put-multiple/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ActualizarConfigEmpleadoMultiple);
        // METODO PARA CONTROLAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO
        this.router.get('/config/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ObtenerConfigEmpleado);
        // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO
        this.router.post('/config-multiple/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ObtenerConfigMultipleEmpleado);

        /** ************************************************************************************ **
         ** **                 METODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** **
         ** ************************************************************************************ **/
        // METODO PARA ENVIAR CORREO DE COMUNICADOS    **USADO
        this.router.post('/mail-comunicado/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarCorreoComunicado);
        // METODO PARA ENVIO DE NOTIFICACION DE COMUNICADOS   **USADO
        this.router.post('/noti-comunicado-multiple/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneralMultiple);



        /** ********************************************************************************************************** **
         ** **          M E T O D O S    U S A D O S   E N    L A    A P L I C A C I O N    M O V I L               ** **
         ** ********************************************************************************************************** **/
        this.router.get('/info-empl-recieve', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.getInfoEmpleadoByCodigo);
        this.router.get('/all-noti', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.getNotificacion);
        this.router.get('/noti-tim/all-noti', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.getNotificacionTimbres);



















        // ----------------------------- VERIFICAR SU USO EN LA APLICACION MOVIL
        // RUTA DE ACCESO A DATOS DE COMUNICADOS APLICACION MÓVIL
        this.router.post('/noti-comunicado-movil/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneral);
        this.router.post('/noti-comunicado-multiplador-movil/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneralMultiple);
        // METODO PARA ENVIAR CORREO DE APROBACION MULTIPLE DESDE LA APLICACION  MÓVIL
        this.router.post('/mail-multiple-movil/', NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarCorreoSolicitudes);





        // METODO DE ENVIO DE NOTIFICACIONES DE COMUNICADOS    **USADO
        this.router.post('/noti-comunicado/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarNotificacionGeneral);
        // NOTIFICACIONES RECIBIDAS POR UN USUARIO
        this.router.get('/receives/:id_receive', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ListarNotificacionUsuario);
        // RUTA PARA CREAR NOTIFICACION
        this.router.post('/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.CrearNotificacion);
        // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
        this.router.get('/one/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ObtenerUnaNotificacion);
        this.router.get('/all-receives/:id_receive', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ListaNotificacionesRecibidas);
        this.router.put('/vista/:id', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.ActualizarVista);
        this.router.put('/eliminar-multiples/avisos', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EliminarMultiplesNotificaciones);
        // METODO PARA ENVIAR CORREO DE APROBACION MULTIPLE
        this.router.post('/mail-multiple/', TokenValidation, NOTIFICACION_TIEMPO_REAL_CONTROLADOR.EnviarCorreoSolicitudes);

    }
}

const NOTIFICACION_TIEMPO_REAL_RUTAS = new NotificacionTiempoRealRutas();

export default NOTIFICACION_TIEMPO_REAL_RUTAS.router;