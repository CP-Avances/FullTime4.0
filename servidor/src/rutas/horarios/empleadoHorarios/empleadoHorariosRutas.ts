import EMPLEADO_HORARIOS_CONTROLADOR from '../../../controlador/horarios/empleadoHorarios/empleadoHorariosControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

class EmpleadoHorariosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR HORARIOS EXISTENTES DEL USUARIO EN FECHAS DETERMINADAS  **USADO                     
        this.router.post('/horarios-existentes1/:id_empleado', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarHorariosExistentes);
        this.router.post('/horarios-existentes', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarHorariosExistentes2);
        this.router.post('/buscar-horarios-multiples', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.BuscarFechasMultiples);

        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN EL MISMO DIA
        this.router.post('/horario-horas-mismo-dia', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerHorarioHorasMD);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN DIAS DIFERENTES
        this.router.post('/horario-horas-dias-diferentes', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerHorarioHorasDD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN EL MISMO DIA
        this.router.post('/horario-comida-horas-mismo-dia', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerComidaHorarioHorasMD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN DIAS DIFERENTES
        this.router.post('/horario-comida-horas-dias-diferentes', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerComidaHorarioHorasDD);
        // METODO PARA VERIFICAR SI EXISTE PLANIFICACION   **USADO
        this.router.post('/validarFechas', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarFechasHorario);

 }
}

const EMPLEADO_HORARIOS_RUTAS = new EmpleadoHorariosRutas();

export default EMPLEADO_HORARIOS_RUTAS.router;