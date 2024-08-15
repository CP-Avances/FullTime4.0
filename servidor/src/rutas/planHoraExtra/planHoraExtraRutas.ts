import { ModuloHoraExtraValidation } from '../../libs/Modulos/verificarHoraExtra'
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';
import PLAN_HORA_EXTRA_CONTROLADOR from '../../controlador/planHoraExtra/planHoraExtraControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanHoraExtra);

        this.router.get('/justificar', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanHoraExtraObserva);
        this.router.get('/autorizacion', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanHoraExtraAutorizada);

        this.router.put('/estado/:id', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ActualizarEstado);

        this.router.get('/datosAutorizacion/:id_plan_extra', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ObtenerDatosAutorizacion);

        // ACTUALIZACION DE TIEMPO AUTORIZADO 
        this.router.put('/tiempo-autorizado/:id', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.TiempoAutorizado);




        /** ******************************************************************************************************* **
         ** **                               PLANIFICACION DE HORAS EXTRAS                                       ** **
         ** ******************************************************************************************************* **/

        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS
        this.router.post('/', [TokenValidation], PLAN_HORA_EXTRA_CONTROLADOR.CrearPlanHoraExtra);
        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS POR USUARIO
        this.router.post('/hora_extra_empleado', [TokenValidation], PLAN_HORA_EXTRA_CONTROLADOR.CrearPlanHoraExtraEmpleado);
        // BUSQUEDA DE PLANIFICACIONES DE HORAS EXTRAS
        this.router.get('/planificaciones', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanificacion);
        // BUSQUEDA DE DATOS DE PLANIFICACION POR ID DE PLANIFICACION
        this.router.get('/plan_empleado/:id_plan_hora', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanEmpleados);
        // ELIMINAR PLANIFICACION DE ALIMENTACION
        this.router.delete('/eliminar/:id', TokenValidation, PLAN_HORA_EXTRA_CONTROLADOR.EliminarRegistros);
        // ELIMINAR PLANIFICACION DE UN USUARIO    **USADO
        this.router.delete('/eliminar/plan-hora/:id/:id_empleado', TokenValidation, PLAN_HORA_EXTRA_CONTROLADOR.EliminarPlanEmpleado);
        // BUSQUEDA DE DATOS DE PLANIFICACION POR ID DE USUARIO   **USADO
        this.router.get('/listar-plan/:id', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.BuscarPlanUsuario);
        

        /** ******************************************************************************************** **
         ** *             ENVIO DE CORREO ELECTRONICO DE PLANIFICACIONES DE HORAS EXTRAS               * **
         ** ******************************************************************************************** **/

        // CREACION DE PLANIFICACION DE HORAS EXTRAS   **USADO
        this.router.post('/send/correo-planifica/', [TokenValidation], PLAN_HORA_EXTRA_CONTROLADOR.EnviarCorreoPlanificacion);


        /** ******************************************************************************************** **
         ** *                   NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS                       ** **
         ** ******************************************************************************************** **/

        // CREACION DE PLANIFICACION DE HORAS EXTRAS    **USADO
        this.router.post('/send/noti-planifica', TokenValidation, PLAN_HORA_EXTRA_CONTROLADOR.EnviarNotiPlanHE);




    }
}

const PLAN_HORA_EXTRA_RUTAS = new DepartamentoRutas();

export default PLAN_HORA_EXTRA_RUTAS.router;