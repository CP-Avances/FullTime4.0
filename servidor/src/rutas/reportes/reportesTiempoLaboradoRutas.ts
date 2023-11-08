import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken';
import REPORTES_TIEMPO_LABORADO_CONTROLADOR from '../../controlador/reportes/reportesTiempoLaboradoControlador';

class ReportesTiempoLaboradoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REPORTES DE ATRASOS
        this.router.put('/tiempo-laborado-empleados/:desde/:hasta', TokenValidation, REPORTES_TIEMPO_LABORADO_CONTROLADOR.ReporteTiempoLaborado);
        this.router.put('/tiempo-laborado-empleados-regimen-cargo/:desde/:hasta', TokenValidation, REPORTES_TIEMPO_LABORADO_CONTROLADOR.ReporteTiempoLaboradoRegimenCargo);
    }
}

const REPORTES_TIEMPO_LABORADO_RUTAS = new ReportesTiempoLaboradoRutas();

export default REPORTES_TIEMPO_LABORADO_RUTAS.router;