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

        // REPORTES DE TIMBRES MULTIPLE
        this.router.put('/timbres/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresMultiple);
        this.router.put('/timbres-regimen-cargo/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresMultipleRegimenCargo);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL SISTEMA 
        this.router.put('/timbres-sistema/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreSistema);
        this.router.put('/timbres-sistema-regimen-cargo/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreSistemaRegimenCargo);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL 
        this.router.put('/timbres-reloj-virtual/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreRelojVirtual);
        this.router.put('/timbres-reloj-virtual-regimen-cargo/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreRelojVirtualRegimenCargo);

        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL 
        this.router.put('/timbres-horario-abierto/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreHorarioAbierto);
        this.router.put('/timbres-horario-abierto-regimen-cargo/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbreHorarioAbiertoRegimenCargo);

        // REPORTES DE TIMBRES DE HORARIO ABIERTO
        this.router.get('/timbres-abiertos', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresAbiertos);

        // REPORTES DE TIMBRES INCOMPLETOS
        this.router.put('/timbres-incompletos/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresIncompletos);
        this.router.put('/timbres-incompletos-regimen-cargo/:desde/:hasta', TokenValidation, REPORTE_A_CONTROLADOR.ReporteTimbresIncompletosRegimenCargo);
    }
}

const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();

export default REPORTES_A_RUTAS.router;
