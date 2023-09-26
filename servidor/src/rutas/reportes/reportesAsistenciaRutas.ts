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

         // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR CARGOS
         this.router.get(`/informacion-general-cargo/:estado`, TokenValidation, REPORTE_A_CONTROLADOR.DatosGeneralesCargo);













        // Reportes de Atrasos
        this.router.put('/atrasos-empleados/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteAtrasosMultiple);

        // Reportes de Faltas
        this.router.put('/faltas-empleados/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteFaltasMultiple);
        this.router.put('/faltas-tabulado/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteFaltasMultipleTabulado);

        // Reportes de Horas Trabajadas
        this.router.put('/horas-trabaja/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteHorasTrabajaMultiple);

        // Reportes de Puntualidad
        this.router.put('/puntualidad/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReportePuntualidad);

        // Reportes de Timbres Multiple
        this.router.put('/timbres/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresMultiple);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL SISTEMA 
        this.router.put('/timbres-sistema/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreSistema);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL 
        this.router.put('/timbres-reloj-virtual/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreRelojVirtual);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL 
        this.router.put('/timbres-horario-abierto/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreHorarioAbierto);

        // REPORTES DE TIMBRES DE HORARIO ABIERTO
        this.router.get('/timbres-abiertos', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresAbiertos);

        // Reportes de Timbres Tabulado
        this.router.put('/timbres-tabulados/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresTabulado);

        // Reportes de Timbres incompletos
        this.router.put('/timbres-incompletos/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresIncompletos);

    }
}

const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();

export default REPORTES_A_RUTAS.router;
