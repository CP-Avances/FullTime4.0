import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import REPORTES_ATRASOS_CONTROLADOR from '../../controlador/reportes/reportesAtrasosControlador';

class ReportesAtrasosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REPORTES DE ATRASOS
        this.router.put('/atrasos-empleados/:desde/:hasta', TokenValidation, REPORTES_ATRASOS_CONTROLADOR.ReporteAtrasos);
        this.router.put('/atrasos-empleados-regimen-cargo/:desde/:hasta', TokenValidation, REPORTES_ATRASOS_CONTROLADOR.ReporteAtrasosRegimenCargo);
    }
}

const REPORTES_ATRASOS_RUTAS = new ReportesAtrasosRutas();

export default REPORTES_ATRASOS_RUTAS.router;