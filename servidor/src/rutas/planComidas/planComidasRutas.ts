import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import PLAN_COMIDAS_CONTROLADOR from '../../controlador/planComidas/planComidasControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {


        this.router.get('/infoComida/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaIdEmpleado);
        this.router.get('/infoComida/estado/aprobado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaAprobada);
        this.router.get('/infoComida/estado/negado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaNull);
        this.router.get('/infoComida/estado/expirada', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaExpirada);

        /** PLANIFICACIÓN DE ALIMENTACIÓN */
        this.router.get('/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ListarPlanComidas);
        this.router.post('/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearPlanComidas);
        this.router.get('/fin_registro', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ObtenerUltimaPlanificacion);


        this.router.put('/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarPlanComidas);

        this.router.post('/duplicidad/plan', TokenValidation, PLAN_COMIDAS_CONTROLADOR.BuscarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.BuscarSolEmpleadoFechasActualizar);

        this.router.post('/duplicidad/actualizar/plan', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/actualizar/sol', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarSolComidaEmpleadoFechas);

        this.router.post('/empleado/plan/consumido', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarPlanComidaEmpleadoConsumido);


        // Registrar en tabla tipo_comida
        this.router.post('/tipo_comida', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearTipoComidas);
        this.router.get('/tipo_comida', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ListarTipoComidas);
        this.router.get('/tipo_comida/ultimo', TokenValidation, PLAN_COMIDAS_CONTROLADOR.VerUltimoTipoComidas);


        /** ************************************************************************************************ **
         ** **                   METODOS DE MANEJO DE SOLICTUDES DE ALIMENTACIÓN                          ** **
         ** ************************************************************************************************ **/

        // CREAR SOLICITUD DE ALIMENTACION
        this.router.post('/solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearSolicitaComida);
        // EDITAR SOLIICTUD DE ALIMENTACION
        this.router.put('/actualizar-solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarSolicitaComida);
        // ELIMINAR REGISTRO DE SOLICITUD DE ALIMENTACION
        this.router.delete('/eliminar/sol-comida/:id', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarSolicitudComida);
        // ACTUALIZAR APROBACION DE SOLICITUD DE COMIDA
        this.router.put('/solicitud-comida/estado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.AprobarSolicitaComida);


        /** ************************************************************************************************ **
         ** **                 METODO DE MANEJO DE PLANIFICACION DE ALIMENTACION                          ** **
         ** ************************************************************************************************ **/

        // METODO DE CREACION DE PLANIFICACION DE ALIMENTACION
        this.router.post('/empleado/solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearComidaAprobada);
        // METODO DE ELIMINACION DE ALIMENTACION APROBADA
        this.router.delete('/eliminar/plan-solicitud/:id/:fecha/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarComidaAprobada);
        // ELIMINAR PLANIFICACION DE ALIMENTACION
        this.router.delete('/eliminar/:id', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarRegistros);
        // ELIMINAR PLANIFICACION DE UN USUARIO
        this.router.delete('/eliminar/plan-comida/:id/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarPlanComidaEmpleado);
        // REGISTRO DE LA PLANIFICACIÓN DE ALIMENTACIÓN AL EMPLEADO 
        this.router.post('/empleado/plan', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearPlanEmpleado);
        // BUSQUEDA DE DATOS DE USUARIO POR ID DE PLANIFICACION
        this.router.get('/comida-empleado/plan/:id', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarPlanComidaIdPlan);
        // BUSQUEDA DE PLANIFICACIONES DE ALIMENTACION POR ID DE USUARIO
        this.router.get('/infoComida/plan/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarPlanComidaIdEmpleado);
                

        /** ************************************************************************************************ **
         ** *                     NOTIFICACIONES DE SERVICIOS DE ALIMENTACIÓN                             ** **
         ** ************************************************************************************************ **/

        // METODO DE ENVIO DE NOTIFICACIONES DE SOLICITUDES
        this.router.post('/send/planifica/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarNotificacionComidas);


        /** ************************************************************************************************ **
         ** *                     ENVIO DE CORREO DE SERVICIOS DE ALIMENTACION                            ** **
         ** ************************************************************************************************ **/

        // METODO DE ENVIO DE CORREO DE SOLICITUD DE SERVICIO DE ALIMENTACION
        this.router.post('/mail-noti/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoComidas);
        // METODO DE ENVIO DE CORREO ELECTRONICO DE PLANIFICACION DE SERVICIO DE ALIMENTACION APP WEB
        this.router.post('/mail-plan-comida/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoPlanComidas);
        // METODO DE ENVIO DE CORREO ELECTRONICO DE SOLICITUD DE SERVICIO DE ALIMENTACION APP MOVIL
        this.router.post('/mail-noti-solicitud-comida-movil/:id_empresa', PLAN_COMIDAS_CONTROLADOR.EnviarCorreoComidasMovil);


    }
}

const PLAN_COMIDAS_RUTAS = new DepartamentoRutas();

export default PLAN_COMIDAS_RUTAS.router;