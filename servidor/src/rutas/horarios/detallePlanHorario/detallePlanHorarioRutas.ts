import { Router } from 'express';
import DETALLE_PLAN_HORARIO_CONTROLADOR from '../../../controlador/horarios/detallePlanHorario/detallePlanHorarioControlador';
import { TokenValidation } from '../../../libs/verificarToken'

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class DetallePlanHorarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, DETALLE_PLAN_HORARIO_CONTROLADOR.ListarDetallePlanHorario);
        this.router.get('/infoPlan/:id_plan_horario', TokenValidation, DETALLE_PLAN_HORARIO_CONTROLADOR.EncontrarPlanHoraDetallesPorIdPlanHorario);
        this.router.post('/', TokenValidation, DETALLE_PLAN_HORARIO_CONTROLADOR.CrearDetallePlanHorario);
       this.router.put('/', TokenValidation, DETALLE_PLAN_HORARIO_CONTROLADOR.ActualizarDetallePlanHorario);
        this.router.delete('/eliminar/:id', TokenValidation, DETALLE_PLAN_HORARIO_CONTROLADOR.EliminarRegistros);
        this.router.post('/verificarRegistro', TokenValidation, DETALLE_PLAN_HORARIO_CONTROLADOR.ObtenerRegistrosFecha);
        this.router.post('/verificarDuplicado/:id', TokenValidation, DETALLE_PLAN_HORARIO_CONTROLADOR.VerificarDuplicidadEdicion);

        // Verificar datos de la plantilla de detalles del plan horario
        this.router.post('/verificarDatos/:id_plan_horario/upload', TokenValidation, multipartMiddleware, DETALLE_PLAN_HORARIO_CONTROLADOR.VerificarDatos);
        this.router.post('/verificarPlantilla/upload', TokenValidation, multipartMiddleware, DETALLE_PLAN_HORARIO_CONTROLADOR.VerificarPlantilla);
        this.router.post('/:id_plan_horario/upload', TokenValidation, multipartMiddleware, DETALLE_PLAN_HORARIO_CONTROLADOR.CrearDetallePlanificacionPlantilla);
        this.router.post('/plan_general/:id/:codigo/upload', TokenValidation, multipartMiddleware, DETALLE_PLAN_HORARIO_CONTROLADOR.CrearPlanificacionGeneral);
    }
}

const DETALLE_PLAN_HORARIO_RUTAS = new DetallePlanHorarioRutas();

export default DETALLE_PLAN_HORARIO_RUTAS.router;