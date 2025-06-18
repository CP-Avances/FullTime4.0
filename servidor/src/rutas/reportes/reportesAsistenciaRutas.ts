import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import REPORTE_A_CONTROLADOR from '../../controlador/reportes/reportesAsistenciaControlador';

class ReportesAsistenciasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO    
        this.router.post('/timbres/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresMultiple);

        // METODO DE BUSQUEDA DE TIMBRES DE TIMBRE VIRTUAL      **USADO      
        this.router.post('/timbres-sistema/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreSistema);

        // METODO DE BUSQUEDA DE TIMBRES DEL RELOJ VIRTUAL    **USADO 
        this.router.post('/timbres-reloj-virtual/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreRelojVirtual);

        // METODO DE BUSQUEDA DE TIMBRES HORARIO ABIERTO    **USADO  
        this.router.post('/timbres-horario-abierto/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreHorarioAbierto);

        // METODO DE BUSQUEDA DE TIMBRES INCOMPLETOS      **USADO    
        this.router.post('/timbres-incompletos/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresIncompletos);













        // LISTA DEPARTAMENTOS CON EMPLEADOS ACTIVOS O INACTIVOS
        this.router.get('/datos_generales/:estado', TokenValidation, REPORTE_A_CONTROLADOR.DatosGeneralesUsuarios);

    }
}

const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();

export default REPORTES_A_RUTAS.router;
