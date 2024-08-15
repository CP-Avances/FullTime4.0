import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import REPORTE_A_CONTROLADOR from '../../controlador/reportes/reportesAsistenciaControlador';

class ReportesAsistenciasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // LISTA DEPARTAMENTOS CON EMPLEADOS ACTIVOS O INACTIVOS
        this.router.get('/datos_generales/:estado', TokenValidation, REPORTE_A_CONTROLADOR.DatosGeneralesUsuarios);
       
        // REPORTES DE TIMBRES MULTIPLE      **USADO
        this.router.post('/timbres/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresMultiple);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL SISTEMA      **USADO
        this.router.post('/timbres-sistema/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreSistema);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL      **USADO
        this.router.post('/timbres-reloj-virtual/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreRelojVirtual);

        // REPORTES DE TIMBRES HORARIO ABIERTO    **USADO
        this.router.post('/timbres-horario-abierto/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreHorarioAbierto);

        // REPORTES DE TIMBRES INCOMPLETOS     **USADO
        this.router.post('/timbres-incompletos/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresIncompletos);

    }
}

const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();

export default REPORTES_A_RUTAS.router;
