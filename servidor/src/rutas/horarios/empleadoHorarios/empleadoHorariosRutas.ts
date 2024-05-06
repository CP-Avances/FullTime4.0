import { Router } from 'express';
import EMPLEADO_HORARIOS_CONTROLADOR from '../../../controlador/horarios/empleadoHorarios/empleadoHorariosControlador';
import { TokenValidation } from '../../../libs/verificarToken'

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class EmpleadoHorariosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {


        // METODO PARA BUSCAR HORARIOS EXISTENTES DEL USUARIO EN FECHAS DETERMINADAS  --**VERIFICADO
        this.router.post('/horarios-existentes/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarHorariosExistentes);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN EL MISMO DIA
        this.router.post('/horario-horas-mismo-dia', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerHorarioHorasMD);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN DIAS DIFERENTES
        this.router.post('/horario-horas-dias-diferentes', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerHorarioHorasDD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN EL MISMO DIA
        this.router.post('/horario-comida-horas-mismo-dia', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerComidaHorarioHorasMD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN DIAS DIFERENTES
        this.router.post('/horario-comida-horas-dias-diferentes', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerComidaHorarioHorasDD);
        // METODO PARA VERIFICAR SI EXISTE PLANIFICACION   --**VERIFICADO
        this.router.post('/validarFechas/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarFechasHorario);













        // Verificar datos de la plantilla del horario de un empleado

        this.router.post('/verificarPlantilla/upload', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.VerificarPlantilla_HorarioEmpleado);
        this.router.post('/plan_general/upload/:id/:codigo', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.CrearPlanificacionGeneral);
    }
}

const EMPLEADO_HORARIOS_RUTAS = new EmpleadoHorariosRutas();

export default EMPLEADO_HORARIOS_RUTAS.router;