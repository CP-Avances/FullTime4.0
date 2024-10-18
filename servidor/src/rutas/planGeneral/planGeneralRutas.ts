import PLAN_GENERAL_CONTROLADOR from '../../controlador/planGeneral/planGeneralControlador';
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA REGISTRAR PLAN GENERAL  **USADO
        this.router.post('/', TokenValidation, PLAN_GENERAL_CONTROLADOR.CrearPlanificacion);
        this.router.post('/cargar-planificacion', TokenValidation, PLAN_GENERAL_CONTROLADOR.CrearPlanificacion2);

        // METOOD PARA BUSCAR ID POR FECHAS PLAN GENERAL  **USADO
        this.router.post('/buscar_fechas', TokenValidation, PLAN_GENERAL_CONTROLADOR.BuscarFechas);
        // METOOD PARA BUSCAR ID POR FECHAS PLAN GENERAL MULTIPLE 
        this.router.post('/buscar_fechas_multiple', TokenValidation, PLAN_GENERAL_CONTROLADOR.BuscarFechasMultiples);
        // METODO PARA ELIMINAR REGISTROS  **USADO
        this.router.post('/eliminar', TokenValidation, PLAN_GENERAL_CONTROLADOR.EliminarRegistros);
          // METODO PARA ELIMINAR REGISTROS MULTIPLES  **USADO
          this.router.post('/eliminar-multiples', TokenValidation, PLAN_GENERAL_CONTROLADOR.EliminarRegistrosMultiples);
        // METODO PARA BUSCAR HORARIO DE UN USUARIO POR FECHAS
        this.router.post('/horario-general-fechas', TokenValidation, PLAN_GENERAL_CONTROLADOR.BuscarHorarioFechas);
        // METODO PARA LISTAR PLANIFICACION DE USUARIOS  **USADO
        this.router.post('/horario-general-planificacion', TokenValidation, PLAN_GENERAL_CONTROLADOR.ListarPlanificacionHoraria);
        // METODO PARA LISTAR DETALLE DE HORARIOS DE LOS USUARIOS    **USADO
        this.router.post('/horario-general-detalle', TokenValidation, PLAN_GENERAL_CONTROLADOR.ListarDetalleHorarios);
        // METODO PARA LISTAR SOLO HORARIOS DE USUARIOS  **USADO
        this.router.post('/horario-solo-planificacion/lista', TokenValidation, PLAN_GENERAL_CONTROLADOR.ListarHorariosUsuario);
        // METODO PARA BUSCAR ASISTENCIA   **USADO
        this.router.post('/buscar-asistencia', TokenValidation, PLAN_GENERAL_CONTROLADOR.BuscarAsistencia);
        // METODO PARA ACTUALIZAR ASISTENCIA MANUAL   **USADO
        this.router.post('/actualizar-asistencia/manual', TokenValidation, PLAN_GENERAL_CONTROLADOR.ActualizarManual);


        this.router.post('/buscar_fecha/plan', TokenValidation, PLAN_GENERAL_CONTROLADOR.BuscarFecha);
    }
}

const PLAN_GENERAL_RUTAS = new DepartamentoRutas();

export default PLAN_GENERAL_RUTAS.router;