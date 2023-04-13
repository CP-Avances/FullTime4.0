import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import VACUNAS_REPORTE_CONTROLADOR from '../../controlador/reportes/reporteVacunasControlador';

class ReportesAsistenciasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REPORTE DE VACUNAS MÚLTIPLES
        this.router.put('/vacunas-multiples/', TokenValidation, VACUNAS_REPORTE_CONTROLADOR.ReporteVacunasMultiple);

    }
}

const VACUNAS_REPORTE_RUTAS = new ReportesAsistenciasRutas();

export default VACUNAS_REPORTE_RUTAS.router;
