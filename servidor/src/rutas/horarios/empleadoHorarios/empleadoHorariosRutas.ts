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

        // METODO DE BUSQUEDA DE HORARIOS DE UN USUARIO
        this.router.get('/horarioCodigo/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ListarHorarioUsuario);
        // METODO PARA REGISTRAR HORARIO DE USUARIO
        this.router.post('/', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.CrearEmpleadoHorarios);
        // METODO PARA ACTUALIZAR HORARIO DE USUARIO
        this.router.put('/', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ActualizarEmpleadoHorarios);
        // METODO PARA BUSCAR HORARIOS EXISTENTES DEL USUARIO EN FECHAS DETERMINADAS  --**VERIFICADO
        this.router.post('/horarios-existentes/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarHorariosExistentes);
        // METODO PARA BUSCAR HORARIOS EXISTENTES DEL USUARIO EN FECHAS DETERMINADAS ACTUALIZACION
        this.router.post('/horarios-existentes-edicion/:empl_id', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarHorariosExistentesEdicion);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR DIAS
        this.router.post('/horario-dias', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerHorarioDias);
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










        this.router.get('/', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ListarEmpleadoHorarios);


        this.router.post('/cargaMultiple', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.CargarMultiplesHorariosEmpleadosPlantilla);

        this.router.delete('/eliminar/:id', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.EliminarRegistros);
        this.router.post('/fechas_horario/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerHorariosEmpleadoFechas);
        this.router.post('/validarFechas/horarioEmpleado/:id/empleado/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarFechasHorarioEdicion);

        this.router.post('/busqueda-horarios/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.BuscarHorariosFechas);


        // Verificar datos de la plantilla del horario de un empleado
        this.router.post('/revisarData/:id', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.VerificarDatos_PlantillaEmpleado_Horario);
        this.router.post('/verificarPlantilla/upload', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.VerificarPlantilla_HorarioEmpleado);
        this.router.post('/plan_general/upload/:id/:codigo', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.CrearPlanificacionGeneral);
        this.router.post('/upload/:id/:codigo', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.CrearHorarioEmpleadoPlantilla);
    }
}

const EMPLEADO_HORARIOS_RUTAS = new EmpleadoHorariosRutas();

export default EMPLEADO_HORARIOS_RUTAS.router;