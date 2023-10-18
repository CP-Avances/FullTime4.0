import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import VACACIONES_CONTROLADOR from '../../controlador/vacaciones/vacacionesControlador';

class VacacionesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, VACACIONES_CONTROLADOR.ListarVacaciones);
        this.router.get('/estado-solicitud', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionesAutorizadas);
        this.router.get('/:id', TokenValidation, VACACIONES_CONTROLADOR.VacacionesIdPeriodo);

        this.router.post('/fechasFeriado', TokenValidation, VACACIONES_CONTROLADOR.ObtenerFechasFeriado);



        this.router.get('/datosSolicitud/:id_emple_vacacion', TokenValidation, VACACIONES_CONTROLADOR.ObtenerSolicitudVacaciones);
        this.router.get('/datosAutorizacion/:id_vacaciones', TokenValidation, VACACIONES_CONTROLADOR.ObtenerAutorizacionVacaciones);

        /** ************************************************************************************************* **
         ** **                          METODOS PARA MANEJO DE VACACIONES                                  ** ** 
         ** ************************************************************************************************* **/

        // CREAR REGISTRO DE VACACIONES
        this.router.post('/', TokenValidation, VACACIONES_CONTROLADOR.CrearVacaciones);
        // EDITAR REGISTRO DE VACACIONES
        this.router.put('/:id/vacacion-solicitada', TokenValidation, VACACIONES_CONTROLADOR.EditarVacaciones);
        // BUSQUEDA DE VACACIONES MEDIANTE ID
        this.router.get('/listar/vacacion/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionId);
        // ELIMINAR SOLICITUD DE VACACIONES
        this.router.delete('/eliminar/:id_vacacion', TokenValidation, VACACIONES_CONTROLADOR.EliminarVacaciones);
        // EDITAR ESTADO DE VACACIONES
        this.router.put('/:id/estado', TokenValidation, VACACIONES_CONTROLADOR.ActualizarEstado);
        // BUSCAR DATOS DE VACACIONES POR ID DE VACACION
        this.router.get('/one/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarUnaVacacion);


        /** ************************************************************************************************* **
         ** **                        METODO DE ENVIO DE NOTIFICACIONES                                    ** ** 
         ** ************************************************************************************************* **/

        // ENVIO DE CORREO DE VACACIONES DESDE APLICACIONES WEB
        this.router.post('/mail-noti/', TokenValidation, VACACIONES_CONTROLADOR.EnviarCorreoVacacion);
        // ENVIO DE CORREO DE VACACIONES DESDE APLICACION MOVIL
        this.router.post('/mail-noti-vacacion-movil/:id_empresa', VACACIONES_CONTROLADOR.EnviarCorreoVacacionesMovil);

    }
}

const VACACIONES_RUTAS = new VacacionesRutas();

export default VACACIONES_RUTAS.router;