import { Router } from 'express';
import PLAN_HORARIO_CONTROLADOR from '../../../controlador/horarios/planHorario/planHorarioControlador';
import { TokenValidation } from '../../../libs/verificarToken'

class PlanHorarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA VERIFICAR FECHAS HORARIOS
        this.router.post('/validarFechas/:codigo', TokenValidation, PLAN_HORARIO_CONTROLADOR.VerificarFechasPlan);
        // METODO PARA VERIFICAR FECHAS HORARIOS ACTUALIZACION
        this.router.post('/validarFechas/horarioEmpleado/:id/empleado/:codigo', TokenValidation, PLAN_HORARIO_CONTROLADOR.VerificarFechasPlanEdicion);




/* SE ELIMINA EL SERVICIO
        // BUSQUEDA DE HORARIOS ROTATIVOS POR CODIGO DE USUARIO
        this.router.get('/rotativo/:codigo', TokenValidation, PLAN_HORARIO_CONTROLADOR.BuscarHorarioRotativoCodigo);
*/



        this.router.get('/', TokenValidation, PLAN_HORARIO_CONTROLADOR.ListarPlanHorario);
        this.router.post('/', TokenValidation, PLAN_HORARIO_CONTROLADOR.CrearPlanHorario);
        this.router.get('/buscar/:id_empleado', TokenValidation, PLAN_HORARIO_CONTROLADOR.EncontrarIdPlanHorario);
        this.router.get('/datosPlanHorario/:id', TokenValidation, PLAN_HORARIO_CONTROLADOR.EncontrarPlanHorarioPorId);
        this.router.put('/', TokenValidation, PLAN_HORARIO_CONTROLADOR.ActualizarPlanHorario);
        this.router.delete('/eliminar/:id', TokenValidation, PLAN_HORARIO_CONTROLADOR.EliminarRegistros);
        this.router.post('/fechas_plan/:codigo', TokenValidation, PLAN_HORARIO_CONTROLADOR.ObtenerPlanificacionEmpleadoFechas);


    }
}

const PLAN_HORARIO_RUTAS = new PlanHorarioRutas();

export default PLAN_HORARIO_RUTAS.router;